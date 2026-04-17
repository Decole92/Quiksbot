type BusinessHourPeriod = {
  startTime: string;
  endTime: string;
  isOpen: boolean;
};

type BusinessHours = {
  [key: string]: BusinessHourPeriod[];
};

export const fetchCalendarEvents = async (accessToken: string) => {
  //   setLoading(true);
  try {
    const startDate = new Date("2025-01-01T00:00:00Z");
    const endDate = new Date("2027-12-31T23:59:59Z");
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&showDeleted=false&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data?.items || [];
  } catch (err) {
    return err;
  }
};

export const fetchUserEmail = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();
    // setUserEmail(data.email);
    return data?.email;
  } catch (err) {
    //setError("Failed to fetch email: ", err.message);
    return err;
  }
};

export const formatBusinessHours = (businessHour: BusinessHours) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  return days
    .map((day) => {
      const periods = businessHour[day];
      if (periods.length === 0 || periods.every((p) => !p.isOpen)) {
        return `${day.charAt(0).toUpperCase() + day.slice(1)}: closed`;
      } else {
        const openPeriods = periods
          .filter((p) => p.isOpen)
          .map((p) => `${p.startTime}–${p.endTime}`);
        return `${
          day.charAt(0).toUpperCase() + day.slice(1)
        }: ${openPeriods.join(" and ")}`;
      }
    })
    .join(" \n- ");
};
