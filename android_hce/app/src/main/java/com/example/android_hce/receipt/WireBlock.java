package com.example.android_hce.receipt;

import android.content.ContentValues;
import android.util.Log;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class WireBlock {
    private final int p1;
    private final int p2;
    private final byte[] data;

    public void fill(ContentValues row) {
        row.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_TYPE, p1);
        row.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_INDEX, p2);
    }

    public class Cursor {
        private int pos = 0;

        public String readString() {
            int len = data[pos++] & 0xff;
            byte[] arr = new byte[len];
            for (int i=0;i<len;i++) {
                arr[i] = (byte)readByte();
            }
            return new String(arr);
        }

        public int readInt() {
            int  ret = readByte();
            ret = (ret << 8) | readByte();
            ret = (ret << 8) | readByte();
            ret = (ret << 8) | readByte();
            return ret;
        }

        private int readByte() {
            return data[pos++] & 0xff;
        }
    }

    public WireBlock(int p1, int p2, byte[] data) {
        this.p1 = p1;
        this.p2 = p2;
        this.data = data;
    }

    public boolean is(int forP1) {
        return p1 == forP1;
    }

    private Cursor cursor() {
        return new Cursor();
    }

    public DbContent read() {
        switch (p1) {
            case 0x11:
                return readHeader(this);
            case 0x12:
                return readPreface(this);
            case 0x21:
                return readLineItem(this);
            case 0x22:
            case 0x23:
                return readItemComment(this);
            case 0x31:
            case 0x32:
            case 0x33:
            case 0x3f:
                return readTotal(this);
            case 0x41:
                return readPayment(this);
            case 0x51:
                return readFooter(this);
            default:
                Log.w("wireblock", "could not decipher block with p1 = " + p1);
                return null;
        }
    }

    private static Header readHeader(WireBlock wb) {
        if (wb.p1 != 0x11) {
            throw new RuntimeException(wb.p1 + " is not a header line");
        }
        Cursor c = wb.cursor();
        String text = c.readString();
        return new Header(text);
    }

    public static Preface readPreface(WireBlock wb) {
        if (wb.p1 != 0x12) {
            throw new RuntimeException(wb.p1 + " is not a preface line");
        }
        Cursor c = wb.cursor();
        String title = c.readString();
        String value = c.readString();
        return new Preface(title, value);
    }

    public static LineItem readLineItem(WireBlock wb) {
        if (wb.p1 != 0x21) {
            throw new RuntimeException(wb.p1 + " is not a line item");
        }
        Cursor c = wb.cursor();
        String desc = c.readString();
        int price = c.readInt();
        return new LineItem(desc, price);
    }

    public static DbContent readItemComment(WireBlock wb) {
        if ((wb.p1 & 0xf0) != 0x20 || wb.p1 < 0x22) {
            throw new RuntimeException(wb.p1 + " is not a line item comment");
        }
        Cursor c = wb.cursor();
        switch (wb.p1) {
            case 0x22: {
                int quant = c.readInt();
                int unit = c.readInt();
                return new LineItemQuant(quant, unit);
            }
            case 0x23: {
                String expl = c.readString();
                int disc = c.readInt();
                return new LineItemMultiBuy(expl, disc);
            }
            default:
                throw new RuntimeException("cannot handle line item comment " + wb.p1);
        }
    }

    public static Total readTotal(WireBlock wb) {
        if ((wb.p1 & 0xf0) != 0x30) {
            throw new RuntimeException(wb.p1 + " is not a total line");
        }
        Cursor c = wb.cursor();
        String text = c.readString();
        int amount = c.readInt();
        return new Total(text, amount);
    }

    public static Payment readPayment(WireBlock wb) {
        if (wb.p1 != 0x41) {
            throw new RuntimeException(wb.p1 + " is not a payment line");
        }
        Cursor c = wb.cursor();
        String text = c.readString();
        int amount = c.readInt();
        return new Payment(text, amount);
    }

    public static Footer readFooter(WireBlock wb) {
        if (wb.p1 != 0x51) {
            throw new RuntimeException(wb.p1 + " is not a footer line");
        }
        Cursor c = wb.cursor();
        String text = c.readString();
        return new Footer(text);
    }}
