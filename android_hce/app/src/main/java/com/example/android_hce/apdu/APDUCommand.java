package com.example.android_hce.apdu;

import com.example.android_hce.SessionController;

public interface APDUCommand {
    void params(byte p1, byte p2);

    boolean wantsInput();

    boolean wantsOutputLength();

    void buffers(byte[] in, byte[] out);

    APDUResponse dispatch(SessionController controller);
}
