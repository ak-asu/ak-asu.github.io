import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import RotatableSphere from "./Sphere";
import Board from "./Board";
import type { RootState } from "@/store/store";
import { AnimationLevel } from "@/lib/types";
import { getAssetPath } from "@/lib/utils";
import about from "@/data/about.json";

const SphereWithBoard: React.FC = () => {
  const { animationLevel } = useSelector((state: RootState) => state.mode);
  const disableAnim = animationLevel !== AnimationLevel.High;

  // Show animated sphere and board for medium/high animation levels
  return (
    <div className="flex flex-col justify-evenly items-center w-full h-full md:flex-row">
      <div className={`flex-1 w-[300px] ${disableAnim ? "" : "h-[300px]"}`}>
        {
          // Show simple intro when animation level is low
          disableAnim ? (
            <div className="flex flex-col justify-center items-center w-full h-full p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center max-w-md"
              >
                {/* Circular Profile Photo */}
                <div className="mb-6">
                  <img
                    src={getAssetPath("aakash.jpg")}
                    alt={about.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-palette-teal/20 shadow-lg"
                  />
                </div>
                {/* Name and Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {about.name}
                </h1>
                {/* Short Description */}
                <p className="text-lg md:text-xl text-muted-foreground mb-4">
                  {about.title}
                </p>
                {/* Brief Bio */}
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {about.description}
                </p>
              </motion.div>
            </div>
          ) : (
            <RotatableSphere />
          )
        }
      </div>
      <div className="flex-1 justify-center w-full max-w-[300px]">
        <Board />
      </div>
    </div>
  );
};

export default SphereWithBoard;
