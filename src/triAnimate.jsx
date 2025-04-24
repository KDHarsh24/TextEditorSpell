import { useState, useEffect } from "react";
import "./App.css";

const TrieAnimation = () => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (animationStep < 5) {
        setAnimationStep(prevStep => prevStep + 1);
      }
    }, 1500); // Adjust the interval to control speed of animation
    
    return () => clearInterval(timer); // Clean up timer on unmount
  }, [animationStep]);

  // Function to render the animation steps of Trie structure
  const renderTrieAnimation = () => {
    switch (animationStep) {
      case 1:
        return <div className="trie-node">Root</div>;
      case 2:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">T</div>
          </>
        );
      case 3:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">T</div>
            <div className="trie-node">Tr</div>
          </>
        );
      case 4:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">T</div>
            <div className="trie-node">Tr</div>
            <div className="trie-node">Tri</div>
          </>
        );
      case 5:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">T</div>
            <div className="trie-node">Tr</div>
            <div className="trie-node">Tri</div>
            <div className="trie-node">Tria</div>
          </>
        );
      default:
        return <div className="trie-node">Root</div>;
    }
  };

  return (
    <div className="trie-animation-container">
      <h3>Trie Animation</h3>
      <div className="trie-animation">{renderTrieAnimation()}</div>
    </div>
  );
};

export default TrieAnimation;
