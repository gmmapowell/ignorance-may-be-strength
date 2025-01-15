package com.example.android_hce;

import android.app.Service;
import android.content.Intent;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

public class ReceiveReceiptService extends HostApduService {
    public ReceiveReceiptService() {
    }

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras) {
       Log.w("service", "processApdu");
       return new byte[] { (byte)0x90, 0x00 }; // APDU "OK"
    }
    @Override
    public void onDeactivated(int reason) {
        Log.w("service", "lost contact with card: " + reason);
    }
}
