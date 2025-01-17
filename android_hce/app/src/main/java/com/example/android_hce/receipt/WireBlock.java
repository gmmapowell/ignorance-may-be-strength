package com.example.android_hce.receipt;

public class WireBlock {
    private final int p1;
    private final int p2;
    private final byte[] data;

    public WireBlock(int p1, int p2, byte[] data) {
        this.p1 = p1;
        this.p2 = p2;
        this.data = data;
    }
}
