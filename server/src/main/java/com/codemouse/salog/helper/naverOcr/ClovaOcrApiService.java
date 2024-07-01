package com.codemouse.salog.helper.naverOcr;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.nimbusds.jose.shaded.json.JSONArray;
import com.nimbusds.jose.shaded.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.StreamSupport;

/**
 * Naver CLOVA OCR API Service (네이버 ocr api 호출)
 */
@Service
public class ClovaOcrApiService {
    @Value("${naver.ocr.key}")
    private String secretKey;

    @Value("${naver.ocr.url}")
    private String apiUrl;

    /**
     * 네이버 ocr api 호출
     * Content-Type : application/json
     * X-OCR-SECRET : {X-OCR-SECRET}
     */
    public ClovaOcrDto callOcrApi(String base64Image){
        ClovaOcrDto parseData = null;

        try {
            URL url = new URL(apiUrl);
            HttpURLConnection con = (HttpURLConnection)url.openConnection();
            con.setUseCaches(false);
            con.setDoInput(true);
            con.setDoOutput(true);
            con.setReadTimeout(30000);
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            con.setRequestProperty("X-OCR-SECRET", secretKey);

            JSONObject json = new JSONObject();
            json.put("version", "V2");
            json.put("requestId", UUID.randomUUID().toString());
            json.put("timestamp", System.currentTimeMillis());
            JSONObject image = new JSONObject();
            image.put("format", "jpg"); // 임시 jpg 한정
            image.put("data", base64Image);
            image.put("name", "receipt");
            JSONArray images = new JSONArray();
            images.add(image);
            json.put("images", images);
            String postParams = json.toString();

            // url로 연결 및 json 데이터 입력
            con.connect();
            DataOutputStream wr = new DataOutputStream(con.getOutputStream());
            wr.writeBytes(postParams);
            wr.flush();
            wr.close();

            int responseCode = con.getResponseCode();
            BufferedReader br;
            if (responseCode == 200) {
                br = new BufferedReader(new InputStreamReader(con.getInputStream()));
            } else {
                br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
            }
            String inputLine;
            StringBuffer response = new StringBuffer();
            while ((inputLine = br.readLine()) != null) {
                response.append(inputLine);
            }
            br.close();

            // response를 파싱하여 필요한 데이터를 추출
            String responseJson = response.toString();
            JsonParser parser = new JsonParser();
            JsonObject responseObject = parser.parse(responseJson).getAsJsonObject();
            JsonArray imagesArray = responseObject.getAsJsonArray("images");

            // 각 항목이 null값을 가질 경우에 대한 optional 처리
            parseData = StreamSupport.stream(imagesArray.spliterator(), false)
                    .map(JsonElement::getAsJsonObject)
                    .map(imageObject -> Optional.ofNullable(imageObject.getAsJsonObject("receipt")))
                    .map(optionalReceipt -> optionalReceipt.map(receipt -> receipt.getAsJsonObject("result")))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(resultObject -> {
                        String storeInfo = Optional.ofNullable(resultObject.getAsJsonObject("storeInfo"))
                                .map(storeInfoObj -> storeInfoObj.getAsJsonObject("name"))
                                .map(nameObj -> nameObj.get("text"))
                                .map(JsonElement::getAsString)
                                .orElse("");

                        String paymentDate = Optional.ofNullable(resultObject.getAsJsonObject("paymentInfo"))
                                .map(paymentInfoObj -> paymentInfoObj.getAsJsonObject("date"))
                                .map(dateObj -> dateObj.getAsJsonObject("formatted"))
                                .map(dateFormattedObj -> String.format("%s-%s-%s",
                                        dateFormattedObj.get("year").getAsString(),
                                        dateFormattedObj.get("month").getAsString(),
                                        dateFormattedObj.get("day").getAsString()))
                                .orElse("");

                        int totalPrice = Optional.ofNullable(resultObject.getAsJsonObject("totalPrice"))
                                .map(totalPriceObj -> totalPriceObj.getAsJsonObject("price"))
                                .map(priceObj -> priceObj.getAsJsonObject("formatted"))
                                .map(formattedObj -> formattedObj.get("value"))
                                .map(JsonElement::getAsInt)
                                .orElse(0);

                        return new ClovaOcrDto(paymentDate, totalPrice, storeInfo);
                    })
                    .findFirst()
                    .orElse(new ClovaOcrDto("", 0, ""));    // 스트림이 비어있는 경우 비어있는 객체 반환 null 방지

        } catch (Exception e) {
            System.out.println(e);
        }

        return parseData;
    }

    public String convertImageToBase64(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        BufferedImage image = ImageIO.read(url);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", bos);   // 임시 jpg 한정
        byte[] imageBytes = bos.toByteArray();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        return base64Image;
    }


}
