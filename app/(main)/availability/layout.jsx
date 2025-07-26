import { Suspense } from "react";

const AvailabilityLayout = ({ children }) => {
  return (
    <div className="mx-auto">
      <Suspense fallback={<div>Loading Events...</div>}>{children}</Suspense>
    </div>
  );
};

export default AvailabilityLayout;
