package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class Payment implements DbContent {
    public final String text;
    public final int amount;

    public Payment(String t, int a) {
        this.text = t;
        this.amount = a;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_TEXT, text);
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_AMOUNT, amount);
    }
}
