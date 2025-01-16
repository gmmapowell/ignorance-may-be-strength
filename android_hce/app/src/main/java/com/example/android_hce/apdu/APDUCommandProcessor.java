package com.example.android_hce.apdu;

import android.util.Log;

import java.util.concurrent.atomic.AtomicInteger;

public class APDUCommandProcessor {
    public void LogInput(byte[] apdu) {
        StringBuilder sb = new StringBuilder("apdu = ");
        for (int i=0;i<apdu.length;i++) {
            int x = ((int)apdu[i])&0xff;
            String s = Integer.toHexString(x);
            if (s.length() < 2)
                sb.append("0");
            sb.append(s);
            sb.append(" ");
        }
        Log.w("service", sb.toString());
    }

    public APDUCommand parse(byte[] apdu) {
        byte clz = apdu[0];
        byte inst = apdu[1];
        APDUCommand ret = figureCommand(clz, inst);
        if (ret == null) {
            return null;
        }
        byte p1 = apdu[2];
        byte p2 = apdu[3];
        ret.params(p1, p2);
        AtomicInteger pos = new AtomicInteger(4);
        byte[] in = null, out = null;
        if (ret.wantsInput()) {
            int xx = readLength(apdu, pos);
            Log.w("processor", "input length = " + xx);
            in = new byte[xx];
            for (int i=0;i<xx;i++) {
                in[i] = apdu[pos.getAndIncrement()];
            }
        }
        if (ret.wantsOutputLength()) {
            int s = apdu[pos.getAndIncrement()];
            if (s != 0) {
                Log.w("processor", "allocating " + s + " bytes for response");
                out = new byte[s];
            }
        }

        if (pos.get() != apdu.length) {
            throw new RuntimeException("incorrect length: read " + pos.get() + " != " + apdu.length);
        }
        ret.buffers(in, out);

        return ret;
    }

    private int readLength(byte[] apdu, AtomicInteger pos) {
        byte b = apdu[pos.getAndIncrement()];
        if (b == 0x00) {
            // read two more bytes that make up a longer length
            int b1 = ((int)apdu[pos.getAndIncrement()])&0xff;
            if (b1 == 0) {
                // I don't have a reference, but I think the rule here is that this is how you say 0
                return 0;
            }
            int b2 = ((int)apdu[pos.getAndIncrement()])&0xff;
            return b1*256 + b2;
        } else {
            return b;
        }
    }

    private APDUCommand figureCommand(byte clz, byte inst) {
        int uclz = ((int)clz)&0xff;
        int uinst = ((int)inst)&0xff;
        switch (uclz) {
            case 0x00: {
                switch (uinst) {
                    case 0xa4:
                        return new APDUSelectCommand();
                }
            }
            case 0xff: {
                switch (uinst) {
                    case 0xd6:
                        return new APDUUpdateBinaryCommand();
                }
            }
        }
        Log.w("processor", "do not understand APDU command " + uclz + " " + uinst);
        return null;
    }
}
