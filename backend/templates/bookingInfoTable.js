module.exports = (data) => `

<table>

<tr>

<td class="label">

Booking Number

</td>

<td>

${data.BookingNo || "-"}

</td>

</tr>

<tr>

<td class="label">

Guest Name

</td>

<td>

${data.GuestName || "-"}

</td>

</tr>

<tr>

<td class="label">

Guest Type

</td>

<td>

${data.GuestType || "-"}

</td>

</tr>

<tr>

<td class="label">

Purpose of Visit

</td>

<td>

${data.Purpose || "-"}

</td>

</tr>

<tr>

<td class="label">

Arrival Date & Time

</td>

<td>

${data.ArrivalDate || "-"}

</td>

</tr>

<tr>

<td class="label">

Departure Date & Time

</td>

<td>

${data.DepartureDate || "-"}

</td>

</tr>

${

data.GuestHouse ?

`

<tr>

<td class="label">

Guest House

</td>

<td>

${data.GuestHouse}

</td>

</tr>

`

: ""

}

${

data.RoomNo ?

`

<tr>

<td class="label">

Room Number

</td>

<td>

${data.RoomNo}

</td>

</tr>

`

: ""

}

${

data.RoomType ?

`

<tr>

<td class="label">

Room Type

</td>

<td>

${data.RoomType}

</td>

</tr>

`

: ""

}

<tr>

<td class="label">

Current Status

</td>

<td>

<span class="status">

${data.Status || "-"}

</span>

</td>

</tr>

</table>

`;