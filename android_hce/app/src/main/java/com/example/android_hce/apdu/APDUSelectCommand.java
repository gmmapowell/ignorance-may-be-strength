package com.example.android_hce.apdu;

import android.content.Context;
import android.util.Log;

import com.example.android_hce.ReceiptSessionController;
import com.example.android_hce.ReceiveReceiptService;
import com.example.android_hce.SessionController;
import com.example.android_hce.db.ReceiptDatabaseHelper;

public class APDUSelectCommand extends APDUBaseCommand {
    APDUSelectCommand() {
        super(true, true);
    }

    @Override
    public APDUResponse dispatch(SessionController controller) {
        Log.w("select", "we have selected an aid");
        return new APDUResponse(false, (byte)0x90, (byte)0x00);
    }

    public SessionController initiate(Context context, ReceiptDatabaseHelper db) {
        return new ReceiptSessionController(context, db);
    }
}
