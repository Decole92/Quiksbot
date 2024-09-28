import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = `https://api.ipdata.co?api-key=${process?.env.IP_KEY}`;

  try {
    // Make the GET request
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    const { country_name, city, latitude, longitude } = data;

    // console.log("this is data", data);
    return NextResponse.json(
      { country: country_name, city: city, lat: latitude, lng: longitude },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
