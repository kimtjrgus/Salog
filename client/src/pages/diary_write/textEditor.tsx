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
			//   handlers: { image: imageHandler },
			// ImageResize: { modules: ["Resize"] },
			// imageDrop: true,
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

const QuillContainer = styled.div`
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
		font-size: 1.6rem;
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
		padding: 12px 0px;
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

	.ql-snow .ql-stroke {
		stroke: gray;
	}

	.ql-tooltip .ql-flip {
		left: 0;
	}
`;

export default Reactquill;
