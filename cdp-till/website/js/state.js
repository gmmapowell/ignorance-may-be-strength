class RuntimeState {
	constructor(buttons) {
		this.buttons = {}
		for (var k of Object.keys(buttons)) {
			this.buttons[k] = { methodCode: buttons[k].methodCode, styles: buttons[k].methodCode.styles };
		}
	}
}

export { RuntimeState };