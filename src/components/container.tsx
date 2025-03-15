import React from "react";

export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-8 md:px-16 lg:px-32">
    {children}
  </div>;
}
