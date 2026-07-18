import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    // Ithe aapan studentName ani status pan add kela ahe
    const { phoneNumber, date, studentName, status } = body;

    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "mcc_attendance_status", 
        language: {
          code: "en" 
        },
       components: [
         {
           type: "body",
           parameters: [
             { type: "text", text: studentName || "Student" }, // Fallback pan thevla ahe
             { type: "text", text: status || "Present" },      // Fallback
             { type: "text", text: date }         
           ]
         }
       ]
      }
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Meta API Error:", data.error);
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "WhatsApp message sent successfully!", data });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}