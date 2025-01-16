package com.example.android_hce.apdu;

public class APDUResponse {
    boolean closeSession = false;
    byte r1, r2;


    public APDUResponse(boolean close, byte r1, byte r2) {
        this.closeSession = close;
        this.r1 = r1;
        this.r2 = r2;
    }
    public boolean endSession() {
        return closeSession;
    }

    public byte[] asBytes() {
        return new byte[] { r1, r2 };
    }
}
