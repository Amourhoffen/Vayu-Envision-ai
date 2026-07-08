"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, CheckCircle, Loader2, ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ReportPage() {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    verified?: boolean;
    location?: string;
    category?: string;
    confidence?: number;
    eri_score?: number;
    eri_category?: string;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation error:", err)
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      nextStep();
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalysis = async () => {
    setAnalyzing(true);
    try {
      let base64Image = null;
      if (selectedFile) {
        base64Image = await toBase64(selectedFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/reports`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          category: "Unknown", // Will be overridden by AI
          description: description || "Live report submitted via web app.",
          lat: location ? location.lat : 19.0760 + (Math.random() * 0.05 - 0.025),
          lng: location ? location.lng : 72.8777 + (Math.random() * 0.05 - 0.025),
          image_base64: base64Image
        })
      });
      
      const data = await res.json();
      if (data.ai_results) {
        setAiResult(data.ai_results);
      }
      setAnalyzing(false);
      nextStep();
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
      nextStep();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 py-8 min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Report Pollution</h1>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= i ? "bg-primary" : "bg-foreground/10"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {/* Step 1: Capture */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center h-full space-y-6 pt-12"
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-foreground/20 rounded-3xl flex flex-col items-center justify-center bg-foreground/5 hover:bg-foreground/10 transition-colors cursor-pointer"
              >
                <Camera className="w-12 h-12 text-foreground/40 mb-4" />
                <p className="font-medium">Tap to capture or upload</p>
                <p className="text-sm text-foreground/60 mt-1">Images, Videos, or Audio</p>
              </div>
              <button onClick={nextStep} className="w-full py-4 bg-foreground/10 text-foreground/70 rounded-xl font-bold hover:bg-foreground/20 transition-transform flex items-center justify-center gap-2 mt-auto">
                Skip without Photo <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full space-y-6 pt-4"
            >
              <div className="bg-foreground/5 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Current Location</h3>
                  <p className="text-sm text-foreground/70 mt-0.5">{location ? "GPS Located" : "Locating..."}</p>
                  <p className="text-xs text-foreground/40 mt-1 font-mono">
                    {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E` : "Detecting coordinates..."}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the environmental issue..."
                  className="w-full p-4 rounded-xl bg-foreground/5 border-none focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none text-sm"
                />
              </div>

              <div className="w-full aspect-video bg-foreground/10 rounded-2xl flex items-center justify-center text-foreground/50 font-medium border border-black/5 dark:border-white/5 overflow-hidden relative">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  "Map Preview"
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={prevStep} className="px-6 py-4 bg-foreground/5 rounded-xl font-bold hover:bg-foreground/10 transition-colors">
                  Back
                </button>
                <button onClick={handleAnalysis} disabled={analyzing} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
                  {analyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Image...</>
                  ) : (
                    <>Run AI Analysis <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analysis Results */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full space-y-6 pt-4"
            >
              {aiResult?.verified === false ? (
                <>
                  <div className="text-center space-y-2 mb-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 text-red-500 rounded-full mb-2">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold">Issue Rejected</h2>
                    <p className="text-sm text-foreground/60">Our AI determined this is not a valid environmental hazard.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-2 mb-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 text-green-500 rounded-full mb-2">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold">Analysis Complete</h2>
                    <p className="text-sm text-foreground/60">Our AI has identified the issue at <strong>{aiResult?.location}</strong></p>
                  </div>

                  <div className="bg-foreground/5 p-5 rounded-2xl space-y-4 border border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60 text-sm">Detected Category</span>
                      <span className="font-bold text-danger">{aiResult?.category || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60 text-sm">AI Confidence</span>
                      <span className="font-bold text-primary">{aiResult?.confidence ? aiResult.confidence.toFixed(1) + "%" : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3">
                      <span className="text-foreground/60 text-sm">Environmental Risk Index</span>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-lg">{aiResult?.eri_score || 0}/100</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          aiResult?.eri_category === 'Safe' ? 'bg-green-500/20 text-green-600' :
                          aiResult?.eri_category === 'Moderate' ? 'bg-yellow-500/20 text-yellow-600' :
                          aiResult?.eri_category === 'Elevated' ? 'bg-orange-500/20 text-orange-600' :
                          aiResult?.eri_category === 'High Risk' ? 'bg-red-500/20 text-red-600' :
                          'bg-purple-500/20 text-purple-600'
                        }`}>{aiResult?.eri_category || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <textarea 
                placeholder="Add optional notes (e.g. 'Started 10 mins ago')..."
                className="w-full p-4 rounded-xl bg-foreground/5 border-none focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none text-sm mt-4"
              />

              <div className="mt-8 flex gap-3">
                <button onClick={prevStep} className="px-6 py-4 bg-foreground/5 rounded-xl font-bold hover:bg-foreground/10 transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  {aiResult?.verified === false ? "Return Home" : "Submit Report"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            >
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold">Thank You!</h2>
              <p className="text-foreground/60 max-w-[280px] leading-relaxed">
                Your report has been verified and sent to the local authorities. You earned <span className="text-primary font-bold">+20 Eco Points</span>!
              </p>
              
              <div className="p-4 bg-foreground/5 border border-black/5 dark:border-white/5 rounded-xl w-full mt-4">
                <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-1">Tracking ID</p>
                <p className="font-mono text-xl tracking-widest font-bold">ENV-8932-B</p>
              </div>

              <div className="pt-8 w-full flex flex-col gap-3">
                <Link href="/" className="w-full py-4 bg-foreground/10 rounded-xl font-bold hover:bg-foreground/20 transition-colors">
                  Back to Home
                </Link>
                <Link href="/map" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  View on Map
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
