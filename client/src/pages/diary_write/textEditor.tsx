import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { styled } from "styled-components";
import Quill from "quill";
import { ImageActions } from "@xeger/quill-image-actions";
import { ImageFormats } from "@xeger/quill-image-formats";

Quill.register("modules/imageActions", ImageActions);
Quill.register("modules/imageFormats", ImageFormats);

interface propsType {
	body: string;
	onChangeBody: (value: string) => void;
}

const Reactquill = (props: propsType) => {
	const modules = React.useMemo(
		() => ({
			imageActions: {},
			imageFormats: {},
			toolbar: [
				[{ header: [1, 2, 3, false] }],
				["bold", "italic", "underline", "strike"],
				[{ list: "ordered" }, { list: "bullet" }],
				["link", "image"],
				[{ align: [] }, { color: [] }],
				["clean"],
			],
			// ImageResize: { modules: ["Resize"] },
		}),
		[],
	);

	const formats = [
		"header",
		"bold",
		"italic",
		"underline",
		"strike",
		"list",
		"bullet",
		"link",
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
				modules={modules}
				formats={formats}
				value={props.body || ""}
				onChange={(content, delta, source, editor) => {
					editor.getHTML();
					props.onChangeBody(content);
					console.log(content, delta, source);
				}}
				style={{ width: "100%", height: "34rem" }}
				// readOnly={isDisable}
			/>
		</QuillContainer>
	);
};

const QuillContainer = styled.div`
	margin-bottom: 5rem;
	.ql-snow .ql-editor strong {
		font-weight: Bold;
	}

	.ql-snow .ql-editor em {
		font-style: italic;
	}
`;

export default Reactquill;
