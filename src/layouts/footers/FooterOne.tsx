import Image from "next/image"
import Link from "next/link"
import footer_data from "@/data/home-data/FooterData"

import footerLogo_1 from "@/assets/images/logo/CromaAlto.png"
import footerLogo_2 from "@/assets/images/logo/logo_03.svg"
import footerShape_1 from "@/assets/images/shape/shape_32.svg"
import footerShape_2 from "@/assets/images/shape/shape_33.svg"

const icon_1: string[] = ["facebook", "twitter", "instagram"]

const FooterOne = ({ style }: any) => {
   return (
      <div className={`footer-one ${style ? "dark-bg" : ""}`}>
         <div className="position-relative z-1">
            <div className="container">
               <div className="row justify-content-between">
                  <div className="col-sm-4">
                     <div className={`footer-intro ${style ? "position-relative z-1" : ""}`}>
                        <div className="bg-wrapper">
                           <div className="logo mb-20">
                              <Link href="/">
                                 <Image src={style ? footerLogo_2 : footerLogo_1} alt="" />
                              </Link>
                           </div>
                          
                       
                        </div>
                        {style && <Image src={footerShape_1} alt="" className="lazy-img shapes shape_01" />}
                     </div>
                  </div>
               </div>
            </div>
            {style && <Image src={footerShape_2} alt="" className="lazy-img shapes shape_02" />}
            <span>Copyright @2024</span>
         </div>
      </div>
   )
}

export default FooterOne
