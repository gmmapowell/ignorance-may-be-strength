package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class LineItem implements DbContent {
    public final String desc;
    public final int price;

    public LineItem(String d, int p) {
        this.desc = d;
        this.price = p;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_DESC, desc);
        vs.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_VALUE_PRICE, price);
    }
}
