package realtime;  
  
import java.io.UnsupportedEncodingException;  
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.io.FileWriter;  
import java.io.IOException;  

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;

public class GbkName {  
    
    /** 
     * @param args 
     */  
    public static void main(String[] args) throws Exception {  

        String[] stocks = getStockArr();

        for (int i=0; i<stocks.length; i++) {
            System.out.println(stocks[i]);
            //String gbk = HttpRequest("http://hq.sinajs.cn/list=sh600000,sh600004");
            //writeToFile("realtime/datasource/stockNames.txt", gbk); 
        }

        // writeToFile("2.txt", getUTF8StringFromGBKString(gbk));         
        // String utf8 = new String(gbk.getBytes("UTF-8"),"UTF-8");
        // writeToFile("3.txt", utf8);
    }  
    
    public static String[] getStockArr(){
        // String path = "Y:\\works\\github\\node\\stock\\datasource\\klines_base";  
        String path = "D:\\works";
        java.io.File file = new java.io.File(path);  
        System.out.println("stocks:"+ file.exists());
        String[] stocks = file.list();
        System.out.println("stocks:"+ stocks.toString());
        return stocks;
    }

    public static void writeToFile(String filename, String utf8str) {
         try {  
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(filename),"UTF-8");
            writer.write(utf8str);  
            writer.close();  
        } catch (IOException e) {  
            e.printStackTrace();  
        }  
    }

    public static String getUTF8StringFromGBKString(String gbkStr) {  
        try {  
            return new String(getUTF8BytesFromGBKString(gbkStr), "UTF-8");  
        } catch (UnsupportedEncodingException e) {  
            throw new InternalError();  
        }  
    }  
      
    public static byte[] getUTF8BytesFromGBKString(String gbkStr) {  
        int n = gbkStr.length();  
        byte[] utfBytes = new byte[3 * n];  
        int k = 0;  
        for (int i = 0; i < n; i++) {  
            int m = gbkStr.charAt(i);  
            if (m < 128 && m >= 0) {  
                utfBytes[k++] = (byte) m;  
                continue;  
            }  
            utfBytes[k++] = (byte) (0xe0 | (m >> 12));  
            utfBytes[k++] = (byte) (0x80 | ((m >> 6) & 0x3f));  
            utfBytes[k++] = (byte) (0x80 | (m & 0x3f));  
        }  
        if (k < utfBytes.length) {  
            byte[] tmp = new byte[k];  
            System.arraycopy(utfBytes, 0, tmp, 0, k);  
            return tmp;  
        }  
        return utfBytes;  
    }  


     /**
     *
     * @param requestUrl
     */
    public static String HttpRequest(String requestUrl) {
        StringBuffer sb = new StringBuffer();
        InputStream ips = getInputStream(requestUrl);
        InputStreamReader isreader = null;
        try {
            isreader = new InputStreamReader(ips, "GBK");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        BufferedReader bufferedReader = new BufferedReader(isreader);
        String temp = null;
        try {
            while ((temp = bufferedReader.readLine()) != null) {
                sb.append(temp);
                sb.append("\r\n");
            }
            bufferedReader.close();
            isreader.close();
            ips.close();
            ips = null;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }
 
    /**
     * @param requestUrl
     * @return InputStream
     */
    private static InputStream getInputStream(String requestUrl) {
        URL url = null;
        HttpURLConnection conn = null;
        InputStream in = null;
        try {
            url = new URL(requestUrl);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        try {
            conn = (HttpURLConnection) url.openConnection();
            conn.setDoInput(true);
            conn.setRequestMethod("GET");
            conn.connect();
            System.out.println("encoding:"+conn.getHeaderFields().toString());
            in = conn.getInputStream();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return in;
    }
} 