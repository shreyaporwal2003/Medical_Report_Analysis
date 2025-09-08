# 🩺 Medical Report Analysis (AI Powered)

AI-powered medical report analysis platform that allows users to **upload medical reports (PDF, text, scans)** and automatically parses key medical information, generates **structured metrics, summaries, and charts**, and provides insights into conditions like ultrasound findings, blood tests, etc.

---

## ✨ Features

- 🔑 **User Authentication** – Sign up & Sign in with JWT-based auth  
- 📂 **Upload Reports** – Upload medical reports (PDF, TXT, DOCX)  
- 🤖 **AI Parsing** – Extracts structured health metrics (values, units, interpretations)  
- 📊 **Interactive Dashboard** – Visualize trends using charts & graphs  
- 📝 **Text Summary** – Human-friendly summary of findings  
- 🏥 **Supports Multiple Report Types** – Blood tests, Ultrasound, Radiology, etc.  

---

## 🛠️ Tech Stack

**Frontend:**  
- React + Vite ⚡  
- Tailwind CSS 🎨  
- Recharts 📊  
- Axios for API calls  

**Backend:**  
- Node.js + Express 🚀  
- MongoDB + Mongoose 🗄️  
- Multer (file uploads)  
- JWT Authentication  

---

## ⚡ Getting Started (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/Medical_Report_Analysis.git
cd Medical_Report_Analysis
```
### 2️⃣ Backend Setup
```bash
cd backend
npm install
```
**Create a .env file inside backend/:**
-MONGO_URI=your_mongo_connection_string
-JWT_SECRET=your_secret_key
-PORT=5000

**Run backend locally:**
```bash
npm start
```
**Backend runs at 👉** 
```bash 
http://localhost:5000
 ```
### 3️⃣ Frontend Setup


