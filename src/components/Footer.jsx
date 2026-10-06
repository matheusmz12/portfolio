import "../styles/footer.css";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          MATHEUS<span>.DEV</span>
        </div>

        <p className="footer-copy">© {new Date().getFullYear()} Matheus Muniz</p>

        <div className="footer-socials">
          <a href="https://github.com/matheusmz12" target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
          <a href="https://www.instagram.com/matheusmz12" target="_blank" rel="noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://www.linkedin.com/in/matheus-muniz-920036429" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
