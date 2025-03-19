import Image from "next/image";
import Link from "next/link";
import SocialIcon from "@/components/common/SocialIcon";

import titleShape from "@/assets/images/shape/title_shape_04.svg";
import data from "@/assets/images/graph.png";
const FancyBannerOne = ({ style }: any) => {
  return (
    <div
      className={`fancy-banner-one position-relative z-1 pt-160 xl-pt-140 lg-pt-80 pb-140 xl-pb-120 lg-pb-100 ${
        style ? "mt-200 xl-mt-150 lg-mt-120" : ""
      }`}
    >
      <div className={`container ${style ? "container-large" : ""}`}>
        <div className="row">
          <div
            className={`col-lg-6 wow fadeInLeft ${style ? "col-xxl-5" : ""}`}
          >
            <div className="title-one mb-45 lg-mb-30">
              <h3 className="text-white">
                Intelligent Alto AI{" "}
                <span>
                  Automation{" "}
                  {style ? (
                    ""
                  ) : (
                    <Image src={titleShape} alt="" className="lazy-img" />
                  )}
                </span>
              </h3>
              <p className="fs-24 text-white pe-xl-5 me-xxl-5">
                Don't miss out on this personalized demand forecast to optimize
                your inventory every month!
              </p>
            </div>
            <Link href="/dashboard/dashboard-index" className="btn-six">
              More Details
            </Link>
          </div>

          <div className={`col-lg-6 wow fadeInRight ${style ? "ms-auto" : ""}`}>
            <div
              className={`property-item md-mt-60 position-relative z-1 ${
                style ? "rounded-0" : ""
              }`}
            >
              <div className="row gx-0">
                <div className="col-md-12 d-flex">
                  <Image src={data} alt="" />
                </div>
              </div>

              <div className="button-group gutter d-flex justify-content-between align-items-center">
                <Link href="/dashboard/message" className="btn-three">
                  <span>Check Full Details</span>
                </Link>
                <Link
                  href="/dashboard/message"
                  className="btn-four rounded-circle"
                >
                  <i className="bi bi-arrow-up-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FancyBannerOne;
