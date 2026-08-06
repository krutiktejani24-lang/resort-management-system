import React from "react";

const PAYMENT_TYPES = [
  "ALL",
  "CASH",
  "CARD",
  "ONLINE",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function FilterBar({

  search,
  setSearch,

  paymentFilter,
  setPaymentFilter,

  filterMode,
  setFilterMode,

  selectedYear,
  setSelectedYear,

  selectedMonth,
  setSelectedMonth,

  selectedDate,
  setSelectedDate,

}) {

  const years = [];

  for (let i = 0; i < 6; i++) {

    years.push(
      new Date().getFullYear() - i
    );

  }

  return (

    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 20,
        marginBottom: 25,
      }}
    >

      {/* Search + Payment */}

      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >

        <input
          type="text"
          placeholder="Search Guest / Invoice..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={{
            flex: 1,
            minWidth: 250,
            padding: 10,
            border:
              "1px solid #d1d5db",
            borderRadius: 6,
          }}
        />

        <select

          value={paymentFilter}

          onChange={(e) =>
            setPaymentFilter(
              e.target.value
            )
          }

          style={{
            width: 180,
            padding: 10,
            border:
              "1px solid #d1d5db",
            borderRadius: 6,
          }}
        >

          {PAYMENT_TYPES.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

      </div>
            {/* Filter Mode */}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >

        <button
          type="button"
          onClick={() =>
            setFilterMode("MONTH")
          }
          style={{
            padding: "10px 18px",
            background:
              filterMode === "MONTH"
                ? "#15803d"
                : "#fff",
            color:
              filterMode === "MONTH"
                ? "#fff"
                : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Month
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterMode("YEAR")
          }
          style={{
            padding: "10px 18px",
            background:
              filterMode === "YEAR"
                ? "#15803d"
                : "#fff",
            color:
              filterMode === "YEAR"
                ? "#fff"
                : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Year
        </button>

        <button
          type="button"
          onClick={() =>
            setFilterMode("DAY")
          }
          style={{
            padding: "10px 18px",
            background:
              filterMode === "DAY"
                ? "#15803d"
                : "#fff",
            color:
              filterMode === "DAY"
                ? "#fff"
                : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Day
        </button>

        {/* Year */}

        <select
          value={selectedYear}
          onChange={(e) =>
            setSelectedYear(
              Number(e.target.value)
            )
          }
          style={{
            padding: 10,
            border: "1px solid #d1d5db",
            borderRadius: 6,
          }}
        >
          {years.map((year) => (
            <option
              key={year}
              value={year}
            >
              {year}
            </option>
          ))}
        </select>

        {/* Month */}

        {filterMode === "MONTH" && (
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
            style={{
              padding: 10,
              border:
                "1px solid #d1d5db",
              borderRadius: 6,
            }}
          >
            {MONTHS.map(
              (month, index) => (
                <option
                  key={month}
                  value={index}
                >
                  {month}
                </option>
              )
            )}
          </select>
        )}

        {/* Day */}

        {filterMode === "DAY" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(
                e.target.value
              )
            }
            style={{
              padding: 10,
              border:
                "1px solid #d1d5db",
              borderRadius: 6,
            }}
          />
        )}

      </div>
          </div>

  );

}