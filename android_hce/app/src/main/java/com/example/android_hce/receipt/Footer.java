package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class Footer implements DbContent {
    public final String text;

    public Footer(String t) {
        this.text = t;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_TEXT, text);
    }
}
