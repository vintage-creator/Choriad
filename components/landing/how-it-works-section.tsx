"use client";

import { Search, UserCheck, Calendar, CheckCircle } from "lucide-react";
import { useInView, motion } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    icon: Search,
    title: "Post Your Task",
    description: "Describe what you need help with and set your budget",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: UserCheck,
    title: "Get AI Matched",
    description: "Our AI matches you with verified providers in your area",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Calendar,
    title: "Schedule & Pay",
    description: "Choose a time that works and pay securely through the platform",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: CheckCircle,
    title: "Task Complete",
    description: "Your task gets done, and you rate your experience",
    color: "from-orange-500 to-amber-500"
  },
]

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      }
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            How Choriad Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Getting help is simple and secure. Here&apos;s how it works in four easy steps
          </p>
        </motion.div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-2">
            {/* Static Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 rounded-full transform -translate-y-1/2" />
            
            {/* Animated Progress Line */}
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full transform -translate-y-1/2 origin-left"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ 
                duration: 2, 
                delay: 0.5,
                ease: "easeInOut"
              }}
            />
            
            {/* Moving Dot Animation */}
            <motion.div
              className="absolute top-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2"
              initial={{ left: "0%" }}
              animate={isInView ? { left: "100%" } : { left: "0%" }}
              transition={{ 
                duration: 2,
                delay: 0.5,
                ease: "easeInOut"
              }}
            >
              {/* Glow effect around the moving dot */}
              <motion.div
                className="absolute inset-0 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Step Markers with Sequential Animation */}
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className="absolute top-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.8 + (index * 0.3) // Stagger the appearance of markers
                }}
              >
                {/* Fill animation when dot passes */}
                <motion.div
                  className="absolute inset-0 bg-primary rounded-full scale-0"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: 1.3 + (index * 0.5) // Delay based on dot arrival time
                  }}
                />
              </motion.div>
            ))}
          </div>

          {steps.map((step, index) => (
            <motion.div 
              key={step.title} 
              className="relative z-10"
              variants={itemVariants}
            >
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 relative">
                  {/* Step Icon Container */}
                  <motion.div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: index % 2 === 0 ? 5 : -5 
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.6,
                      delay: 1 + (index * 0.2), // Delay based on line progression
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                    
                    {/* Pulse effect when step becomes active */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-white/30"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={isInView ? { 
                        scale: [1, 1.5, 1],
                        opacity: [0, 0.5, 0]
                      } : { scale: 1, opacity: 0 }}
                      transition={{
                        duration: 1,
                        delay: 1.5 + (index * 0.5),
                        repeat: 1,
                        ease: "easeOut"
                      }}
                    />
                  </motion.div>
                  
                  {/* Step Number */}
                  <motion.div 
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-sm font-bold shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 1.2 + (index * 0.2),
                      type: "spring",
                      stiffness: 150
                    }}
                  >
                    {index + 1}
                  </motion.div>
                </div>
                
                <motion.h3 
                  className="font-bold text-xl mb-3 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 1.4 + (index * 0.2)
                  }}
                >
                  {step.title}
                </motion.h3>
                
                <motion.p 
                  className="text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 1.6 + (index * 0.2)
                  }}
                >
                  {step.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Progress Animation */}
        <motion.div 
          className="lg:hidden mt-12 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-3 h-3 bg-primary rounded-full mb-2 relative">
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      delay: 1.3 + index * 0.5 
                    }}
                    viewport={{ once: true }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Step {index + 1}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile Progress Bar with Moving Dot */}
          <div className="h-1 bg-primary/20 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
            
            <motion.div
              className="absolute top-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2"
              initial={{ left: "0%" }}
              whileInView={{ left: "100%" }}
              transition={{ 
                duration: 2,
                delay: 0.5,
                ease: "easeInOut"
              }}
              viewport={{ once: true }}
            >
              <motion.div
                className="absolute inset-0 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}