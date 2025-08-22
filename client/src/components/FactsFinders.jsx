import React, { useState, useRef } from "react";
import axios from "axios";
import { uploadImageToCloudinary } from "../hooks/uploadImage";

const FactsFinders = () => {
  const [form, setForm] = useState({
    dateTime: "",
    name: "",
    etcCode: "",
    customerName: "",
    dob: "",
    contactNo1: "",
    contactNo2: "",
    force: "",
    bn: "",
    comp: "",
    married: "",
    kids: "",
    child1Age: "",
    child2Age: "",
    income: "",
    savings: "",
    insurancePremium: "",
    planName: "",
    mfSipAmount: "",
    investAmount: "",
    futureInvestments: "",
    clientNeeds: "",
    financialServices: "",
    feedback: "",
    customerImage: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCamera = () => fileInputRef.current.click();

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, customerImage: imageUrl }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed!");
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "dateTime",
      "name",
      "etcCode",
      "customerName",
      "dob",
      "contactNo1",
      "force",
      "bn",
      "comp",
      "planName",
      "insurancePremium",
    ];

    for (let field of requiredFields) {
      if (!form[field] || form[field].trim() === "") {
        alert(`Please fill the ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }

    if (!/^\d{10}$/.test(form.contactNo1)) {
      alert("Contact No.1 must be a valid 10-digit number");
      return false;
    }

    if (form.contactNo2 && !/^\d{10}$/.test(form.contactNo2)) {
      alert("Contact No.2 must be a valid 10-digit number");
      return false;
    }

    const numericFields = [
      "insurancePremium",
      "mfSipAmount",
      "investAmount",
      "income",
      "savings",
    ];
    for (let field of numericFields) {
      if (form[field] && isNaN(form[field])) {
        alert(`${field.replace(/([A-Z])/g, " $1")} must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const formWithLocation = { ...form, latitude, longitude };

            await axios.post(
              "http://localhost:5000/api/factsfinders",
              formWithLocation
            );

            alert("Data saved successfully!");
            setForm({
              dateTime: "",
              name: "",
              etcCode: "",
              customerName: "",
              dob: "",
              contactNo1: "",
              contactNo2: "",
              force: "",
              bn: "",
              comp: "",
              married: "",
              kids: "",
              child1Age: "",
              child2Age: "",
              income: "",
              savings: "",
              insurancePremium: "",
              planName: "",
              mfSipAmount: "",
              investAmount: "",
              futureInvestments: "",
              clientNeeds: "",
              financialServices: "",
              feedback: "",
              customerImage: "",
              latitude: "",
              longitude: "",
            });
          } catch (err) {
            console.error(err);
            alert("Failed to save data.");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error(error);
          alert("Unable to fetch location. Please enable GPS.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation not supported.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Facts Finders Form
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Date & Time", name: "dateTime", type: "datetime-local" },
            { label: "Name", name: "name" },
            { label: "ETC Code", name: "etcCode" },
            { label: "Customer Name", name: "customerName" },
            { label: "DOB", name: "dob", type: "date" },
            { label: "Contact No.1", name: "contactNo1" },
            { label: "Contact No.2", name: "contactNo2" },
            { label: "Force / Civil", name: "force" },
            { label: "BN", name: "bn" },
            { label: "Comp", name: "comp" },
            { label: "Married", name: "married" },
            { label: "Kids (Son/Daughter)", name: "kids" },
            { label: "1st Child Age", name: "child1Age" },
            { label: "2nd Child Age", name: "child2Age" },
            { label: "Income", name: "income" },
            { label: "Savings / Investments", name: "savings" },
            { label: "Insurance Premium", name: "insurancePremium" },
            { label: "Plan Name", name: "planName" },
            { label: "MF / SIP Amount", name: "mfSipAmount" },
            { label: "How much you can invest", name: "investAmount" },
            {
              label: "Future Investments / Saving Plans",
              name: "futureInvestments",
            },
            {
              label: "Client Needs / Requirements",
              name: "clientNeeds",
              type: "textarea",
              colSpan: true,
            },
            {
              label: "Financial Services",
              name: "financialServices",
              type: "textarea",
              colSpan: true,
            },
            {
              label: "Feedback",
              name: "feedback",
              type: "textarea",
              colSpan: true,
            },
          ].map((field) => (
            <div
              key={field.name}
              className={field.colSpan ? "col-span-full" : ""}
            >
              <label className="block text-gray-700 font-semibold mb-1">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.label}
                  className="border border-gray-300 rounded-lg p-3 w-full"
                />
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.label}
                  className="border border-gray-300 rounded-lg p-3 w-full"
                />
              )}
            </div>
          ))}

          {/* Camera Capture */}
          <div className="col-span-full">
            <label className="block text-gray-700 font-semibold mb-2">
              Capture Customer Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleImageCapture}
            />
            <button
              type="button"
              onClick={openCamera}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow"
              disabled={imageUploading}
            >
              📷 {imageUploading ? "Uploading..." : "Capture Image"}
            </button>
            {form.customerImage && !imageUploading && (
              <img
                src={form.customerImage}
                alt="Customer"
                className="mt-2 w-32 h-32 object-cover rounded-lg shadow"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSave}
            disabled={loading || imageUploading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl shadow-lg flex items-center justify-center"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                ></path>
              </svg>
            )}
            {loading ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactsFinders;
