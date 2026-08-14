import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { toast } from "react-toastify";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import TransportPriceDetailsModal
  from "../../components/Transport/TransportPriceDetailsModal";

import {
  FaArrowLeft,
  FaCar,
  FaCalendarAlt,
  FaFileAlt,
  FaInfoCircle,
  FaUser,
  FaWallet,
} from "react-icons/fa";

import MobileNumberInput from "../../components/Common/MobileNumberInput";
import EmailInput from "../../components/Common/EmailInput";
import Button from "../../components/Common/Button/Button.jsx";
import PageHeader from "../../components/Common/PageHeader";

import "../../styles/guestHouseForm.css";

import logo from "../../assets/iit-dharwad-logo.png";


// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const readDraft = () => {
  try {
    return JSON.parse(
      localStorage.getItem("transportDraft")
    ) || {};
  } catch {
    return {};
  }
};


// ---------------------------------------------------------
// Form Section
// Same structure as Guest House
// ---------------------------------------------------------

function FormSection({
  icon,
  step,
  title,
  children
}) {
  return (
    <section className="booking-section">

      <header className="booking-section-header">

        <div className="section-icon">
          {icon}
        </div>

        <div>

          <span className="section-step">
            Section {step}
          </span>

          <h2>{title}</h2>

        </div>

      </header>

      <div className="booking-section-body">
        {children}
      </div>

    </section>
  );
}


// ---------------------------------------------------------
// Field
// Same reusable Field as Guest House
// ---------------------------------------------------------

function Field({
  label,
  required = false,
  hint,
  className = "",
  children
}) {
  return (
    <div className={`booking-field ${className}`}>

      <label>

        {label}

        {required && (
          <span className="required-mark">
            {" "}*
          </span>
        )}

      </label>

      {children}

      {hint && (
        <small>{hint}</small>
      )}

    </div>
  );
}


// ---------------------------------------------------------
// Transport Form
// ---------------------------------------------------------

function TransportForm() {

  const navigate = useNavigate();
  const location = useLocation();

  const draft = {
    ...readDraft(),
    ...(location.state || {})
  };

  const [employee, setEmployee] = useState({});

  const [loadingMasters, setLoadingMasters] = useState(true);

  const [expenditureHeads, setExpenditureHeads] = useState([]);
  const [projects, setProjects] = useState([]);

  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const [formData, setFormData] = useState({

    // Vehicle Details

    seatingCapacity:
      draft.seatingCapacity || "",

    bookingType: draft.bookingType || "",

    expenditureHeadType: draft.expenditureHeadType || "",
    projectDetails: draft.projectDetails || "",


    // Traveller Details
    travellerName: draft.travellerName || "",

    travellerAddress:
      draft.travellerAddress ||
      draft.TravellerAddress ||
      "",

    numberOfTravellers:
      draft.numberOfTravellers || "",


    // Journey Details
    departureLocation:
      draft.departureLocation || "",

    arrivalLocation:
      draft.arrivalLocation || "",

    purposeOfTravel:
      draft.purposeOfTravel || "",

    special:
      draft.special || ""

  });


  const [countryCode, setCountryCode] =
    useState(
      draft.countryCode || "+91"
    );

  const [travellerMobile, setTravellerMobile] =
    useState(
      draft.travellerMobile || ""
    );

  const [travellerEmail, setTravellerEmail] =
    useState(
      draft.travellerEmail || ""
    );

  const [departureDateTime, setDepartureDateTime] =
    useState(
      draft.departureDateTime
        ? new Date(draft.departureDateTime)
        : null
    );

  const [arrivalDateTime, setArrivalDateTime] =
    useState(
      draft.arrivalDateTime
        ? new Date(draft.arrivalDateTime)
        : null
    );

  const [uploadedFile, setUploadedFile] =
    useState(null);

  const [filePreview, setFilePreview] =
    useState(
      draft.uploadedFileUrl || ""
    );

  const uploadedFileRef =
    useRef(null);

  const [activeSection, setActiveSection] =
    useState("vehicle-details");


  // -------------------------------------------------------
  // Load Employee + Masters
  // -------------------------------------------------------

  useEffect(() => {

    let active = true;

    let el = null;

    try {

      el =
        window.top.document.querySelector(
          "#spnUserName"
        );

    } catch (error) {

      console.log(
        "Unable to read ERP username"
      );

    }


    const employeeRequest = el?.innerText

      ? api.get(
        "/api/user/me",
        {
          params: {
            name:
              el.innerText.trim()
          }
        }
      )

      : Promise.resolve({
        data: {
          success: false
        }
      });


    Promise.allSettled([

      employeeRequest,

      api.get(
        "/api/expenditure-heads"
      )

    ]).then(
      ([user, heads]) => {

        if (!active) return;


        // Employee
        if (
          user.status === "fulfilled" &&
          user.value.data.success
        ) {

          setEmployee(
            user.value.data.data
          );

        }


        // Expenditure heads
        if (
          heads.status === "fulfilled"
        ) {

          setExpenditureHeads(
            heads.value.data
          );

        }


        setLoadingMasters(false);

      }
    );

    return () => {

      active = false;

    };

  }, []);

  useEffect(() => {

    if (formData.expenditureHeadType === "Project Fund") {

      loadProjects();

    } else {

      setProjects([]);

      setFormData(current => ({
        ...current,
        projectDetails: ""
      }));

    }

  }, [formData.expenditureHeadType]);

  const loadProjects = async () => {

    try {

      const response = await api.get(
        "/api/master/projects"
      );

      setProjects(response.data);

    }
    catch (error) {

      toast.error("Unable to load projects");

    }

  };


  // -------------------------------------------------------
  // Active section observer
  // -------------------------------------------------------

  useEffect(() => {

    const sections =
      document.querySelectorAll(
        ".form-section"
      );


    const observer =
      new IntersectionObserver(

        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                setActiveSection(
                  entry.target.id
                );

              }

            }
          );

        },

        {
          threshold: 0.35,

          rootMargin:
            "-80px 0px -45% 0px"
        }

      );


    sections.forEach(
      section =>
        observer.observe(section)
    );


    return () =>
      observer.disconnect();

  }, []);


  // -------------------------------------------------------
  // Generic field update
  // -------------------------------------------------------

  const updateField = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormData(
      current => ({
        ...current,
        [name]: value
      })
    );

  };


  // -------------------------------------------------------
  // Departure Date
  // -------------------------------------------------------

  const changeDepartureDateTime = (
    date
  ) => {

    setDepartureDateTime(date);


    if (
      date &&
      arrivalDateTime &&
      arrivalDateTime <= date
    ) {

      setArrivalDateTime(null);

    }

  };


  // -------------------------------------------------------
  // Arrival Date
  // -------------------------------------------------------

  const changeArrivalDateTime = (
    date
  ) => {

    if (
      date &&
      departureDateTime &&
      date <= departureDateTime
    ) {

      toast.error(
        "Arrival date and time must be after departure."
      );

      return;

    }


    setArrivalDateTime(date);

  };


  // -------------------------------------------------------
  // File
  // -------------------------------------------------------

  const handleFile = (event) => {

    const selected =
      event.target.files?.[0];


    if (!selected) return;


    uploadedFileRef.current =
      selected;

    setUploadedFile(
      selected
    );


    const reader =
      new FileReader();


    reader.onload = () => {

      setFilePreview(
        reader.result
      );

    };


    reader.readAsDataURL(
      selected
    );

  };


  // -------------------------------------------------------
  // Build Preview Data
  // -------------------------------------------------------

  const buildPreviewData = () => ({

    ...formData,


    // Traveller
    countryCode,

    travellerMobile,

    travellerContact:
      `${countryCode}${travellerMobile}`,

    travellerEmail,


    // Journey
    departureDateTime:
      departureDateTime instanceof Date &&
        !isNaN(departureDateTime.getTime())
        ? departureDateTime.toISOString()
        : "",

    arrivalDateTime:
      arrivalDateTime instanceof Date &&
        !isNaN(arrivalDateTime.getTime())
        ? arrivalDateTime.toISOString()
        : "",


    // File
    uploadedFile:
      uploadedFileRef.current,

    uploadedFileName:
      uploadedFileRef.current?.name || "",

    uploadedFileUrl:
      filePreview,

    projectDetails: formData.projectDetails,


    // Employee
    userId:
      employee.UserId,

    UserName:
      employee.UserName,

    EmployeeId:
      employee.EmployeeId,

    EmployeeName:
      employee.EmployeeName,

    EmployeeEmail:
      employee.EmployeeEmail,

    MobileNumber:
      employee.MobileNumber,

    RoleMapIDs:
      employee.RoleMapIDs,

    Roles:
      employee.Roles,

    IsAuthenticated:
      employee.IsAuthenticated,

  });


  // -------------------------------------------------------
  // Validation
  // -------------------------------------------------------

  const validate = () => {


    // =====================================================
    // Vehicle Details
    // =====================================================


    const capacity =
      String(
        formData.seatingCapacity
      ).trim();


    if (!capacity) {

      return "Seating capacity is required.";

    }


    if (!/^\d+$/.test(capacity)) {

      return "Seating capacity must contain only digits.";

    }


    if (Number(capacity) < 1) {

      return "Seating capacity must be at least 1.";

    }


    if (Number(capacity) > 100) {

      return "Seating capacity cannot exceed 100.";

    }


    if (!formData.bookingType) {

      return "Select the type of booking.";

    }

    if (!formData.expenditureHeadType) {
      return "Select an expenditure head";
    }

    if (
      formData.expenditureHeadType === "Project Fund" &&
      !formData.projectDetails
    ) {
      return "Select a project";
    }


    // =====================================================
    // Traveller Details
    // =====================================================

    const travellerName =
      formData.travellerName
        .replace(/\s+/g, " ")
        .trim();


    if (!travellerName) {

      return "Traveller Name is required.";

    }


    if (travellerName.length < 3) {

      return "Traveller Name must contain at least 3 characters.";

    }


    if (travellerName.length > 100) {

      return "Traveller Name cannot exceed 100 characters.";

    }


    if (
      !/^[A-Za-z.' -]+$/.test(
        travellerName
      )
    ) {

      return "Traveller Name can contain only letters, spaces, apostrophe ('), hyphen (-) and period (.).";

    }


    // -----------------------------------------------------
    // Traveller Address
    // -----------------------------------------------------

    const travellerAddress =
      formData.travellerAddress
        .replace(/\s+/g, " ")
        .trim();


    if (!travellerAddress) {

      return "Traveller Address is required.";

    }


    if (
      travellerAddress.length < 10
    ) {

      return "Traveller Address must contain at least 10 characters.";

    }


    if (
      travellerAddress.length > 250
    ) {

      return "Traveller Address cannot exceed 250 characters.";

    }


    // -----------------------------------------------------
    // Contact
    // -----------------------------------------------------

    if (
      travellerMobile.length < 10
    ) {

      return "Enter a valid 10-digit Traveller Contact Number.";

    }


    if (
      /^(\d)\1{9}$/.test(
        travellerMobile
      )
    ) {

      return "Traveller Contact Number cannot contain the same digit repeated 10 times.";

    }


    // -----------------------------------------------------
    // Email
    // -----------------------------------------------------

    const email =
      travellerEmail.trim();


    if (!email) {

      return "Traveller Email is required.";

    }


    if (email.length > 100) {

      return "Traveller Email cannot exceed 100 characters.";

    }


    if (/\s/.test(email)) {

      return "Traveller Email cannot contain spaces.";

    }


    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        email
      )
    ) {

      return "Enter a valid Traveller Email address.";

    }


    // -----------------------------------------------------
    // Number of Travellers
    // -----------------------------------------------------

    const numberOfTravellers =
      String(
        formData.numberOfTravellers
      ).trim();


    if (!numberOfTravellers) {

      return "Number of Travellers is required.";

    }


    if (
      !/^\d+$/.test(
        numberOfTravellers
      )
    ) {

      return "Number of Travellers must contain only digits.";

    }


    if (
      Number(numberOfTravellers) < 1
    ) {

      return "Number of Travellers must be at least 1.";

    }


    if (
      Number(numberOfTravellers) > 100
    ) {

      return "Number of Travellers cannot exceed 100.";

    }


    // =====================================================
    // Journey Details
    // =====================================================

    const departureLocation =
      formData.departureLocation
        .replace(/\s+/g, " ")
        .trim();


    if (!departureLocation) {

      return "Departure Location is required.";

    }


    if (
      departureLocation.length < 2
    ) {

      return "Enter a valid Departure Location.";

    }


    const arrivalLocation =
      formData.arrivalLocation
        .replace(/\s+/g, " ")
        .trim();


    if (!arrivalLocation) {

      return "Arrival Location is required.";

    }


    if (
      arrivalLocation.length < 2
    ) {

      return "Enter a valid Arrival Location.";

    }


    if (!departureDateTime) {

      return "Select Departure Date and Time.";

    }


    if (!arrivalDateTime) {

      return "Select Arrival Date and Time.";

    }


    if (
      arrivalDateTime <=
      departureDateTime
    ) {

      return "Arrival Date and Time must be after Departure Date and Time.";

    }


    // -----------------------------------------------------
    // Purpose
    // -----------------------------------------------------

    const purpose =
      formData.purposeOfTravel
        .replace(/\s+/g, " ")
        .trim();


    if (!purpose) {

      return "Purpose of Travel is required.";

    }


    if (purpose.length < 5) {

      return "Purpose of Travel must contain at least 5 characters.";

    }


    if (purpose.length > 250) {

      return "Purpose of Travel cannot exceed 250 characters.";

    }


    return "";

  };


  // -------------------------------------------------------
  // Save Draft
  // -------------------------------------------------------

  const saveDraft = () => {

    const previewData =
      buildPreviewData();


    const {
      uploadedFile,
      ...draftData
    } = previewData;


    localStorage.setItem(

      "transportDraft",

      JSON.stringify({

        ...draftData,

        uploadedFileName:
          uploadedFile?.name || "",

        uploadedFileUrl:
          ""

      })

    );


    toast.success(
      "Transport draft saved on this device"
    );

  };


  // -------------------------------------------------------
  // Continue to Preview
  // -------------------------------------------------------

  const continueToPreview = (
    event
  ) => {

    if (event) {

      event.preventDefault();

    }


    const error =
      validate();


    if (error) {

      toast.error(error);

      return;

    }


    const previewData =
      buildPreviewData();


    const {
      uploadedFile:
      previewUploadedFile,

      ...draftData
    } = previewData;


    localStorage.setItem(

      "transportDraft",

      JSON.stringify({

        ...draftData,

        uploadedFileName:
          previewUploadedFile?.name || "",

        uploadedFileUrl:
          ""

      })

    );


    navigate(
      "/transport/preview",
      {
        state:
          previewData
      }
    );

  };


  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------

  return (

    <main className="booking-form-page">


      {/* ===================================================
          Header
      =================================================== */}

      <PageHeader

        hero

        logo={logo}

        title="Transport Booking System"

        subtitle="Institute Transport Facility"

        description="Submit transport requests for official institute travel and track the requests."

        actions={

          <div className="hero-actions">

            <Button
              variant="outline"
              onClick={() =>
                navigate(-1)
              }
            >
              <FaArrowLeft />
              {" "}Back
            </Button>

          </div>

        }

      />


      <div className="booking-form-layout">


        {/* =================================================
            Sidebar
        ================================================= */}

        <aside className="booking-form-sidebar">


          {/* Employee */}
          <div className="applicant-card">

            <span className="sidebar-label">
              Requesting employee
            </span>


            <div className="employee-avatar">

              {
                employee.EmployeeName
                  ?.charAt(0)
                || "E"
              }

            </div>


            <h3>

              {
                employee.EmployeeName
                ||
                (
                  loadingMasters
                    ? "Loading..."
                    : "Institute Employee"
                )
              }

            </h3>


            <p>

              {
                employee.EmployeeId
                ||
                "Employee ID"
              }

            </p>

          </div>


          {/* Section Navigation */}
          <nav
            className="form-outline"
            aria-label="Form sections"
          >

            <a
              href="#vehicle-details"
              className={
                activeSection ===
                  "vehicle-details"
                  ? "active"
                  : ""
              }
            >
              <span>1</span>
              Booking details
            </a>


            <a
              href="#traveller-details"
              className={
                activeSection ===
                  "traveller-details"
                  ? "active"
                  : ""
              }
            >
              <span>2</span>
              Traveller details
            </a>


            <a
              href="#journey-details"
              className={
                activeSection ===
                  "journey-details"
                  ? "active"
                  : ""
              }
            >
              <span>3</span>
              Journey details
            </a>


            <a
              href="#additional-information"
              className={
                activeSection ===
                  "additional-information"
                  ? "active"
                  : ""
              }
            >
              <span>4</span>
              Additional information
            </a>

          </nav>


          {/* Privacy */}
          <div className="privacy-note">

            <FaInfoCircle />

            <p>
              Traveller and journey information
              is used only for transport processing
              and institute records.
            </p>

          </div>

        </aside>


        {/* =================================================
            Main Form
        ================================================= */}

        <form
          className="booking-form"
          onSubmit={
            continueToPreview
          }
          noValidate
        >


          {/* =================================================
              SECTION 01
              Vehicle Details
          ================================================= */}

          <div
            id="vehicle-details"
            className="form-section"
          >

            <FormSection
              icon={<FaWallet />}
              step="01"
              title="Booking Details"
            >

              <div className="booking-grid">

                {/* Seating Capacity */}
                <Field
                  label="Seating capacity"
                  required
                  hint="Enter the seating capacity of the vehicle."
                >

                  <input
                    type="number"
                    min="1"
                    name="seatingCapacity"
                    value={
                      formData.seatingCapacity
                    }
                    onChange={
                      updateField
                    }
                  />

                </Field>


                {/* Booking Type */}
                <Field
                  label="Type of booking"
                  required
                >

                  <select
                    name="bookingType"
                    value={
                      formData.bookingType
                    }
                    onChange={
                      updateField
                    }
                  >

                    <option value="">
                      Select booking type
                    </option>

                    <option value="Hour Based">
                      Hour Based
                    </option>

                    <option value="Fixed Location Based">
                      Fixed Location Based
                    </option>

                  </select>

                </Field>


                <Field label="Expenditure head" required>
                  <select
                    name="expenditureHeadType"
                    value={formData.expenditureHeadType}
                    onChange={updateField}
                    disabled={loadingMasters}
                  >
                    <option value="">Select expenditure head</option>

                    {expenditureHeads.map((head) => (
                      <option
                        key={head.id}
                        value={head.name}
                      >
                        {head.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {formData.expenditureHeadType === "Project Fund" && (
                  <Field
                    label="Project"
                    required
                  >
                    <select
                      name="projectDetails"
                      value={formData.projectDetails}
                      onChange={updateField}
                    >
                      <option value="">
                        Select Project
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project.ProjectRefNo}
                          value={project.ProjectRefNo}
                        >
                          {project.ProjectRefNo} - {project.ProjectName}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowPriceDetails(true)
                  }
                >
                  View Vehicle Rates
                </Button>

              </div>

            </FormSection>

          </div>


          {/* =================================================
              SECTION 02
              Traveller Details
          ================================================= */}

          <div
            id="traveller-details"
            className="form-section"
          >

            <FormSection
              icon={<FaUser />}
              step="02"
              title="Traveller Details"
            >

              <div className="booking-grid">


                {/* Traveller Name */}
                <Field
                  label="Traveller name"
                  required
                >

                  <input
                    name="travellerName"
                    value={
                      formData.travellerName
                    }
                    onChange={
                      updateField
                    }
                    placeholder="Full name"
                  />

                </Field>


                {/* Number of Travellers */}
                <Field
                  label="Number of travellers"
                  required
                >

                  <input
                    type="number"
                    min="1"
                    name="numberOfTravellers"
                    value={
                      formData.numberOfTravellers
                    }
                    onChange={
                      updateField
                    }
                    placeholder="0"
                  />

                </Field>


                {/* Traveller Address */}
                <Field
                  label="Traveller address"
                  required
                  className="span-2"
                >

                  <textarea
                    name="travellerAddress"
                    value={
                      formData.travellerAddress
                    }
                    onChange={
                      updateField
                    }
                    rows="3"
                    placeholder="Complete postal address"
                  />

                </Field>


                {/* Contact */}
                <div className="component-field">

                  <MobileNumberInput

                    countryCode={
                      countryCode
                    }

                    setCountryCode={
                      setCountryCode
                    }

                    mobile={
                      travellerMobile
                    }

                    setMobile={
                      setTravellerMobile
                    }

                    label="Traveller contact number"

                    required

                  />

                </div>


                {/* Email */}
                <div className="component-field">

                  <EmailInput

                    label="Traveller email"

                    required

                    value={
                      travellerEmail
                    }

                    setValue={
                      setTravellerEmail
                    }

                  />

                </div>

              </div>

            </FormSection>

          </div>


          {/* =================================================
              SECTION 03
              Journey Details
          ================================================= */}

          <div
            id="journey-details"
            className="form-section"
          >

            <FormSection
              icon={<FaCalendarAlt />}
              step="03"
              title="Journey Details"
            >

              <div className="booking-grid">


                {/* Departure Location */}
                <Field
                  label="Departure location"
                  required
                >

                  <input
                    name="departureLocation"
                    value={
                      formData.departureLocation
                    }
                    onChange={
                      updateField
                    }
                    placeholder="Enter departure location"
                  />

                </Field>


                {/* Arrival Location */}
                <Field
                  label="Arrival location"
                  required
                >

                  <input
                    name="arrivalLocation"
                    value={
                      formData.arrivalLocation
                    }
                    onChange={
                      updateField
                    }
                    placeholder="Enter arrival location"
                  />

                </Field>


                {/* Departure Date */}
                <Field
                  label="Departure date and time"
                  required
                >

                  <DatePicker

                    selected={
                      departureDateTime
                    }

                    onChange={
                      changeDepartureDateTime
                    }

                    showTimeSelect

                    timeIntervals={15}

                    dateFormat={
                      "dd MMM yyyy, h:mm aa"
                    }

                    placeholderText={
                      "Select departure"
                    }

                    className={
                      "datepicker-input"
                    }

                    minDate={
                      new Date()
                    }

                  />

                </Field>


                {/* Arrival Date */}
                <Field
                  label="Arrival date and time"
                  required
                >

                  <DatePicker

                    selected={
                      arrivalDateTime
                    }

                    onChange={
                      changeArrivalDateTime
                    }

                    showTimeSelect

                    timeIntervals={15}

                    dateFormat={
                      "dd MMM yyyy, h:mm aa"
                    }

                    placeholderText={
                      "Select arrival"
                    }

                    className={
                      "datepicker-input"
                    }

                    minDate={
                      departureDateTime ||
                      new Date()
                    }

                    disabled={
                      !departureDateTime
                    }

                  />

                </Field>


                {/* Purpose */}
                <Field
                  label="Purpose of travel"
                  required
                  className="span-2"
                >

                  <textarea
                    name="purposeOfTravel"
                    value={
                      formData.purposeOfTravel
                    }
                    onChange={
                      updateField
                    }
                    rows="4"
                    placeholder="Briefly describe the official purpose of this travel"
                  />

                </Field>


              </div>

            </FormSection>

          </div>


          {/* =================================================
              SECTION 04
              Additional Information
          ================================================= */}

          <div
            id="additional-information"
            className="form-section"
          >

            <FormSection
              icon={<FaFileAlt />}
              step="04"
              title="Additional Information"
            >

              <div className="booking-grid">

                <Field label="Additional Info" className="span-2">
                  <textarea name="special" value={formData.special} onChange={updateField} rows="3" />
                </Field>


                {/* Supporting Document */}
                <Field
                  label="Supporting document"
                  className="span-2"
                  hint="PDF, JPG, PNG, DOC or DOCX · Maximum 200 KB"
                >

                  <label className="file-drop-zone">

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={
                        handleFile
                      }
                    />


                    <FaFileAlt />


                    <span>

                      <strong>

                        {
                          uploadedFile?.name
                          ||
                          draft.uploadedFileName
                          ||
                          "Choose a document"
                        }

                      </strong>

                      <small>
                        Click to browse from your device
                      </small>

                    </span>

                  </label>

                </Field>

              </div>

            </FormSection>

          </div>


          {/* =================================================
              Footer Actions
          ================================================= */}

          <footer className="booking-form-actions">

            <div>

              <strong>
                Ready to review?
              </strong>

              <span>
                Your request will not be submitted
                until the next screen.
              </span>

            </div>


            {/* Cancel */}
            <button
              type="button"
              className="cancel-form-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Cancel
            </button>


            {/* Save Draft */}
            <button
              type="button"
              className="save-draft-button"
              onClick={
                saveDraft
              }
            >
              Save draft
            </button>


            {/* Preview */}
            <button
              type="button"
              className="preview-button"
              onClick={
                continueToPreview
              }
            >
              Preview
            </button>

          </footer>

          <TransportPriceDetailsModal
            open={showPriceDetails}
            onClose={() =>
              setShowPriceDetails(false)
            }
          />


        </form>

      </div>

    </main>

  );

}

export default TransportForm;