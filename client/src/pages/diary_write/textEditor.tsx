import React, { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { styled } from "styled-components";
import Quill from "quill";

import { ImageActions } from "@xeger/quill-image-actions";
import { ImageFormats } from "@xeger/quill-image-formats";
import { storage } from "src/firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

Quill.register("modules/imageActions", ImageActions);
Quill.register("modules/imageFormats", ImageFormats);

interface propsType {
  body: string;
  onChangeBody: (value: string) => void;
}

const ReactQuillComponent = (props: propsType) => {
  const quillRef = useRef<any>(null);

  const imageHandler = async (): Promise<void> => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    await new Promise<void>((resolve) => {
      input.addEventListener("change", () => {
        const editor = quillRef.current.getEditor();
        const file = input?.files?.[0];
        const range = editor.getSelection(true);
        if (file) {
          const storageRef = ref(storage, `image/${Date.now()}`);
          const uploadTask = uploadBytes(storageRef, file);
          uploadTask
            .then((snapshot) => {
              getDownloadURL(snapshot.ref)
                .then((url) => {
                  editor.insertEmbed(range.index, "image", url);
                  editor.setSelection(range.index + 1);
                })
                .catch((error) => {
                  console.log(error);
                })
                .finally(() => {
                  resolve();
                });
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          resolve();
        }
      });
    });
  };

  const modules = React.useMemo(
    () => ({
      imageActions: {},
      imageFormats: {},
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ align: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [
            {
              color: [],
            },
            { background: [] },
          ],
          ["image"],
        ],
        handlers: { image: imageHandler },
        imageDrop: true,
        ImageResize: {
          modules: ["Resize"],
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "image",
    "align",
    "color",
    "float",
    "height",
    "width",
  ];

  return (
    <QuillContainer>
      <ReactQuill
        theme="snow"
        ref={quillRef}
        modules={modules}
        formats={formats}
        value={props.body || ""}
        placeholder="오늘의 기록을 남겨보세요.."
        onChange={(content, delta, source, editor) => {
          editor.getHTML();
          props.onChangeBody(content);
          console.log(delta, source);
        }}
        style={{ width: "100%", height: "42rem" }}
        // readOnly={isDisable}
      />
    </QuillContainer>
  );
};

export const QuillContainer = styled.div`
  margin-bottom: 5rem;
  .ql-snow .ql-editor strong {
    font-weight: Bold;
  }

  .ql-snow .ql-editor em {
    font-style: italic;
  }

  .ql-toolbar.ql-snow {
    border: none;
    padding: 0;
    margin: 2rem 0;
  }

  .ql-container.ql-snow {
    border: none;
    font-size: 1.4rem;
  }

  .ql-container > .ql-editor.ql-blank::before {
    left: 0;
  }

  .ql-snow .ql-picker {
    font-size: 18px;
  }

  .ql-toolbar.ql-snow .ql-formats {
    margin-right: 25px;
  }

  .ql-snow .ql-picker.ql-header {
    width: 115px;
  }

  .ql-editor {
    padding: 12px 1rem;
    padding-bottom: 3rem;
    padding-right: 2rem;
    &::-webkit-scrollbar {
      width: 6px; /* 스크롤바의 너비 */
      background-color: transparent; /* 스크롤바 배경색을 투명으로 설정 */
    }

    &::-webkit-scrollbar-thumb {
      height: 30%; /* 스크롤바의 길이 */
      background: ${(props) =>
        props.theme.COLORS.LIGHT_BLUE}; /* 스크롤바의 색상 */
    }

    &::-webkit-scrollbar-track {
      background: rgba(33, 122, 244, 0.1); /*스크롤바 뒷 배경 색상*/
    }
  }

  .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
    width: 20px;
  }
  .ql-snow.ql-toolbar button,
  .ql-snow .ql-toolbar button {
    height: 28px;
    width: 32px;
  }

  .ql-snow .ql-fill,
  .ql-snow .ql-stroke.ql-fill {
    fill: gray;
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item::before {
    color: gray;
  }

  .ql-container > .ql-editor.ql-blank::before {
    left: 1rem;
    right: 2rem;
  }

  .ql-snow .ql-stroke {
    stroke: gray;
  }

  .ql-tooltip .ql-flip {
    left: 0;
  }
`;

export default ReactQuillComponent;
