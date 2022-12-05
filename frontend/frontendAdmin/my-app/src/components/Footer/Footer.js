import React from 'react'
import './Footer.css'
function Footer({amount1},props) {
   console.log(amount1)
  return (
    <div className="footer">
                <h1>T O C O  C L O TH E S </h1>
                <div className="footer_body">
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">Blog</a>
                    <a href="#">About Us</a>
                    <a href="#">Help Center</a>
                </div>
                <div className="footer_bottom">
                    <div className="footer_bottom_title1">
                        <a href="#">Terms of Use</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Privacy Policy</a>
                    </div>
                    <div className="footer_bottom_title2">
                        <a href="#">© 2022 ERES</a>
                    </div>
                </div>
            </div>
  )
}

export default Footer