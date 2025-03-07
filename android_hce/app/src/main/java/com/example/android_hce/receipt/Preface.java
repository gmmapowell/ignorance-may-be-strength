package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class Preface implements DbContent {
    public final String title;
    public final String value;

    public Preface(String t, String v) {
        this.title = t;
        this.value = v;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_TITLE, title);
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_VALUE, value);
    }
}
