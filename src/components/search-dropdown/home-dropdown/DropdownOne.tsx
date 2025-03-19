import NiceSelect from "@/ui/NiceSelect";

const DropdownOne = ({ style }: any) => {
  const selectHandler = (e: any) => {};

  const searchHandler = () => {
    window.location.href = "/listing_0";
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        searchHandler();
      }}
    >
      <div className="row gx-0 align-items-center">
        <div className="col-xl-3 col-lg-4">
          <div className="input-box-one border-left">
            <div className="label">I’m looking to...</div>
            <NiceSelect
              className={`nice-select ${style ? "fw-normal" : ""}`}
              options={[
                { value: "apartments", text: "Home Appliances" },
                { value: "condos", text: "" },
                { value: "houses", text: "Mobile Phones" },
                { value: "industrial", text: "Laptops" },
                { value: "villas", text: "Smart Home Appliances" },
              ]}
              defaultCurrent={0}
              onChange={selectHandler}
              name=""
              placeholder=""
            />
          </div>
        </div>
        <div className={`${style ? "col-xl-3" : "col-xl-4"} col-lg-4`}>
          <div className="input-box-one border-left">
            <div className="label">Location</div>
            <NiceSelect
              className={`nice-select location ${style ? "fw-normal" : ""}`}
              options={[
                { value: "delhi", text: "Delhi, India" },
                { value: "mumbai", text: "Mumbai, Maharashtra" },
                { value: "bangalore", text: "Bangalore, Karnataka" },
                { value: "chennai", text: "Chennai, Tamil Nadu" },
                { value: "kolkata", text: "Kolkata, West Bengal" },
                { value: "hyderabad", text: "Hyderabad, Telangana" },
                { value: "jaipur", text: "Jaipur, Rajasthan" },
              ]}
              defaultCurrent={0}
              onChange={selectHandler}
              name=""
              placeholder=""
            />
          </div>
        </div>
        <div className="col-xl-3 col-lg-4">
          <div className="input-box-one border-left border-lg-0">
            <div className="label">Re Allocate Status</div>
            <NiceSelect
              className={`nice-select ${style ? "fw-normal" : ""}`}
              options={[
                { value: "1", text: "Pending Reallocation" },
                { value: "2", text: "In Progress" },
                { value: "3", text: "Partially Reallocated" },
                { value: "4", text: "Completed Reallocation" },
                { value: "5", text: "Failed Reallocation" },
                { value: "6", text: "Cancelled Reallocation" },
                { value: "7", text: "Under Review" },
                { value: "8", text: "Awaiting Approval" },
                { value: "9", text: "On Hold" },
                { value: "10", text: "Automated Reallocation" },
              ]}
              defaultCurrent={0}
              onChange={selectHandler}
              name=""
              placeholder=""
            />
          </div>
        </div>
        <div className={`${style ? "col-xl-3" : "col-xl-2"}`}>
          <div className="input-box-one lg-mt-10">
            <button
              className={`fw-500 tran3s ${
                style
                  ? "w-100 tran3s search-btn-three"
                  : "text-uppercase search-btn"
              }`}
            >
              {style ? "Search Now" : "Search"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DropdownOne;
