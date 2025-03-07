package com.example.android_hce;

import com.example.android_hce.apdu.APDUCommand;
import com.example.android_hce.apdu.APDUResponse;

public interface SessionController {
    APDUResponse dispatch(APDUCommand cmd);

    void updateBinary(int p1, int p2, byte[] data);

    void executeCommand();
}
