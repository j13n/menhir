import Calendar from "corvu/calendar";
import { Index } from "solid-js";

const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format;
const weekdayLong = new Intl.DateTimeFormat("en", { weekday: "long" }).format;
const weekdayShort = new Intl.DateTimeFormat("en", { weekday: "short" }).format;

export default function CalendarDemo() {
  return (
    <Calendar mode="single">
      {(props) => (
        <div class="calendar">
          <div class="row">
            <Calendar.Nav action="prev-month">Previous month</Calendar.Nav>
            <Calendar.Label>
              {monthName(props.month)} {props.month.getFullYear()}
            </Calendar.Label>
            <Calendar.Nav action="next-month">Next month</Calendar.Nav>
          </div>
          <Calendar.Table>
            <thead>
              <tr>
                <Index each={props.weekdays}>
                  {(weekday) => (
                    <Calendar.HeadCell abbr={weekdayLong(weekday())}>
                      {weekdayShort(weekday())}
                    </Calendar.HeadCell>
                  )}
                </Index>
              </tr>
            </thead>
            <tbody>
              <Index each={props.weeks}>
                {(week) => (
                  <tr>
                    <Index each={week()}>
                      {(day) => (
                        <Calendar.Cell>
                          <Calendar.CellTrigger day={day()}>
                            {day().getDate()}
                          </Calendar.CellTrigger>
                        </Calendar.Cell>
                      )}
                    </Index>
                  </tr>
                )}
              </Index>
            </tbody>
          </Calendar.Table>
          <p>
            Selected:{" "}
            {props.value ? props.value.toLocaleDateString("en") : "none"}
          </p>
        </div>
      )}
    </Calendar>
  );
}
