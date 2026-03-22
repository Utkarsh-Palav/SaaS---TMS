import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const MeetingCalendar = ({ meetingsData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++)
    days.push({ day: "", isCurrentMonth: false });
  for (let i = 1; i <= daysInMonth; i++)
    days.push({ day: i, isCurrentMonth: true });

  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  for (let i = days.length; i < totalCells; i++)
    days.push({ day: "", isCurrentMonth: false });

  const getMonthName = () =>
    currentDate.toLocaleString("default", { month: "long" });
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const getMeetingsForDay = (day) => {
    if (!day) return [];
    return meetingsData?.filter((meeting) => {
      const mDate = new Date(meeting.startTime);
      return (
        mDate.getDate() === day &&
        mDate.getMonth() === currentDate.getMonth() &&
        mDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const formatTimeOnly = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/50">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="text-primary">{getMonthName()}</span>{" "}
          {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-accent hover:shadow-sm rounded-md text-muted-foreground transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-bold text-foreground hover:bg-accent hover:shadow-sm rounded-md transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-accent hover:shadow-sm rounded-md text-muted-foreground transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/80">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <div
            key={i}
            className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-border gap-px flex-1 border-b border-border">
        {days.map((day, i) => {
          const dayMeetings = getMeetingsForDay(day.day);
          const isToday =
            day.isCurrentMonth &&
            new Date().getDate() === day.day &&
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={i}
              className={`min-h-[100px] bg-card p-2 relative group hover:bg-accent/50 transition-colors flex flex-col ${
                !day.isCurrentMonth && "bg-muted/30"
              }`}
            >
              {day.day && (
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    isToday
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {day.day}
                </span>
              )}

              <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                {dayMeetings?.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group/item"
                  >
                    <Link to={`/meetings/${meeting._id}`}>
                      <div className="text-xs font-bold text-foreground truncate">
                        {meeting.title}
                      </div>
                      <div className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {formatTimeOnly(meeting.startTime)}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingCalendar;
