package com.example.android_hce.apdu;

public abstract class APDUBaseCommand implements APDUCommand {
    private final boolean wantsInput;
    private final boolean wantsOutput;
    int p1, p2;
    byte[] input;
    byte[] outbuf;

    public APDUBaseCommand(boolean wantsInput, boolean wantsOutput) {
        this.wantsInput = wantsInput;
        this.wantsOutput = wantsOutput;
    }

    @Override
    public void params(byte p1, byte p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    @Override
    public boolean wantsInput() {
        return wantsInput;
    }

    @Override
    public boolean wantsOutputLength() {
        return wantsOutput;
    }

    @Override
    public void buffers(byte[] in, byte[] out) {
        this.input = in;
        this.outbuf = out;
    }
}
