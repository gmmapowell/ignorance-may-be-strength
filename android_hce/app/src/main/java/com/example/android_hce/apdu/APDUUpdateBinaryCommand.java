package com.example.android_hce.apdu;

import android.util.Log;

import com.example.android_hce.SessionController;

public class APDUUpdateBinaryCommand extends APDUBaseCommand {
    APDUUpdateBinaryCommand() {
        super(true, false);
    }

    @Override
    public APDUResponse dispatch(SessionController controller) {
        Log.w("select", "update binary on " + Integer.toHexString(p1) + ":" + Integer.toHexString(p2));
        if (p1 == 0) {
            // tell the controller that we have read everything and are ready to execute it
            controller.executeCommand();
            // this is a close, so close
            return new APDUResponse(true, (byte)0x90, (byte)0x00);
        }

        controller.updateBinary(p1, p2, input);
        return new APDUResponse(false, (byte)0x90, (byte)0x00);
    }
}
