package com.example.android_hce.db;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import com.example.android_hce.db.ReceiptDatabaseContract.ReceiptEntry;
import com.example.android_hce.db.ReceiptDatabaseContract.ReceiptLineEntry;
import com.example.android_hce.db.ReceiptDatabaseContract.ReceiptLineCommentEntry;

public class ReceiptDatabaseHelper extends SQLiteOpenHelper {
    private static final String SQL_CREATE_RECEIPTS =
            "CREATE TABLE " + ReceiptEntry.TABLE_NAME + " (" +
                    ReceiptEntry._ID + " INTEGER PRIMARY KEY," +
                    ReceiptEntry.COLUMN_NAME_MERCHANT + " TEXT," +
                    ReceiptEntry.COLUMN_NAME_TOTAL + " INTEGER)";

    private static final String SQL_DELETE_RECEIPTS =
            "DROP TABLE IF EXISTS " + ReceiptEntry.TABLE_NAME;

    private static final String SQL_CREATE_ITEM_LINES =
            "CREATE TABLE " + ReceiptLineEntry.TABLE_NAME + " (" +
                    ReceiptLineEntry._ID + " INTEGER PRIMARY KEY," +
                    ReceiptLineEntry.COLUMN_NAME_RECEIPT + " INTEGER," +
                    ReceiptLineEntry.COLUMN_NAME_INDEX + " INTEGER," +
                    ReceiptLineEntry.COLUMN_NAME_TYPE + " INTEGER)";

    private static final String SQL_DELETE_ITEM_LINES =
            "DROP TABLE IF EXISTS " + ReceiptLineEntry.TABLE_NAME;

    private static final String SQL_CREATE_ITEM_COMMENTS =
            "CREATE TABLE " + ReceiptLineCommentEntry.TABLE_NAME + " (" +
                    ReceiptLineCommentEntry._ID + " INTEGER PRIMARY KEY," +
                    ReceiptLineCommentEntry.COLUMN_NAME_ENTRY + " INTEGER," +
                    ReceiptLineCommentEntry.COLUMN_NAME_INDEX + " INTEGER," +
                    ReceiptLineCommentEntry.COLUMN_NAME_TYPE + " INTEGER)";

    private static final String SQL_DELETE_ITEM_COMMENTS =
            "DROP TABLE IF EXISTS " + ReceiptLineCommentEntry.TABLE_NAME;

    // If you change the database schema, you must increment the database version.
    public static final int DATABASE_VERSION = 1;
    public static final String DATABASE_NAME = "Receipts.db";

    public ReceiptDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_RECEIPTS);
        db.execSQL(SQL_CREATE_ITEM_LINES);
        db.execSQL(SQL_CREATE_ITEM_COMMENTS);
    }
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // This database is only a cache for online data, so its upgrade policy is
        // to simply to discard the data and start over
        db.execSQL(SQL_DELETE_ITEM_COMMENTS);
        db.execSQL(SQL_DELETE_ITEM_LINES);
        db.execSQL(SQL_DELETE_RECEIPTS);
        onCreate(db);
    }
    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onUpgrade(db, oldVersion, newVersion);
    }
}
