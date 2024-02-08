const COLORS = {
	WHITE: "#FFF",
	BLACK: "#000",
	SKY: "#CDD8FF",
	GRAY_100: "#F5F5F9",
	GRAY_200: "#E9E9EE",
	GRAY_300: "#D9D9D9",
	GRAY_400: "#C6C6D0",
	GRAY_500: "#838383",
	GRAY_600: "#4F4F4F",
	GRAY_700: "#5C5C5C",
	LIGHT_BLUE: "#839DFA",
	LIGHT_RED: "#FD6E4E",
	LIGHT_GREEN: "#1BBF83",
	LIGHT_YELLOW: "#FFB11A",
};

const device = {
  Extra: `screen and (min-width: 1330px)`,
  large: `screen and (min-width: 992px)`,
  tablet: `screen and (min-width: 768px)`,
  small: `screen and (min-width: 600px)`, 
  mobile: `screen and (max-width: 360px)`,
}

const Theme = {
	COLORS,
	device
};
export default { COLORS, Theme };
