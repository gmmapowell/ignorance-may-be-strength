package com.example.android_hce;

import android.app.NotificationManager;
import android.content.Context;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.example.android_hce.apdu.APDUCommand;
import com.example.android_hce.apdu.APDUCommandProcessor;
import com.example.android_hce.apdu.APDUResponse;
import com.example.android_hce.apdu.APDUSelectCommand;

public class ReceiveReceiptService extends HostApduService {
    APDUCommandProcessor processor = new APDUCommandProcessor();
    SessionController controller = null;

    public ReceiveReceiptService() {
    }

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras) {
        try {
            processor.LogInput(apdu);
            APDUCommand cmd = processor.parse(apdu);
            if (cmd == null) {
                return new byte[] { (byte) 0x69, (byte)0x00 }; // APDU "Command not allowed"
            }
            if (cmd instanceof APDUSelectCommand) {
                controller = ((APDUSelectCommand)cmd).initiate(this);
            }
            if (controller == null) { // no current application selected - is there a more precise code?
                return new byte[] { (byte) 0x6f, (byte) 0x00 }; // APDU "command aborted - OS Error?"
            }
            APDUResponse response = controller.dispatch(cmd);
            if (response.endSession())
                controller = null;
            return response.asBytes();
        } catch (Throwable t) {
            return new byte[] { (byte) 0x6f, (byte) 0x00 }; // APDU "command aborted - OS Error?"
        }
    }

    @Override
    public void onDeactivated(int reason) {
        Log.w("service", "lost contact with card: " + reason);
        if (controller != null) {
            controller = null;
        }
    }
}
