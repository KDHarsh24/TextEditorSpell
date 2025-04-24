import { useState, useRef, useEffect } from "react";
import "./App.css";
import spellCheckAPI from "./api";
import {trackUser} from "./api"; // Import the tracking function
const App = () => {
  useEffect(() => {
    // Call the tracking function when the component mounts
    trackUser();
  }, []); // Empty dependency array to run only once on mount
  const editorRef = useRef(null);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [wordSuggestions, setWordSuggestions] = useState({});
  const [selectedAPI, setSelectedAPI] = useState("spell-check");
  const [selectLang, setSelectLang] = useState("english");
  // Function to check spelling mistakes
  const lastTextRef = useRef(""); // Add this line with other refs if not already added
  const checkText = async () => {
    if (!editorRef.current) return;
  
    const currentText = editorRef.current.innerText;
    const trimmedText = currentText.trim();
    const words = trimmedText.split(/\s+/);
    const lastText = lastTextRef.current;
    lastTextRef.current = currentText;
  
    const lastChar = currentText.slice(-1);
    const isSpaceTyped = /\s|\u00A0/.test(lastChar) && currentText.length > lastText.length;
  
    // 🧹 Remove suggestions for deleted words
    setIncorrectWords((prevIncorrect) =>
      prevIncorrect.filter(({ index, word }) => index < words.length && words[index] === word)
    );
  
    setWordSuggestions((prevSuggestions) => {
      const newSuggestions = {};
      for (let index in prevSuggestions) {
        const idx = parseInt(index);
        if (idx < words.length && words[idx] === incorrectWords.find(w => w.index === idx)?.word) {
          newSuggestions[index] = prevSuggestions[index];
        }
      }
      return newSuggestions;
    });
  
    if (isSpaceTyped) {
      const lastWord = words[words.length - 1];
      if (!lastWord) return;
  
      const alreadyChecked = incorrectWords.find(({ index }) => index === words.length - 1);
      if (!alreadyChecked) {
        try {
          const suggestions = await spellCheckAPI(lastWord, selectedAPI, selectLang);
          if (suggestions.length > 0) {
            setIncorrectWords((prev) => [...prev, { word: lastWord, index: words.length - 1 }]);
            setWordSuggestions((prev) => ({ ...prev, [words.length - 1]: suggestions }));
          }
        } catch (error) {
          console.error("❌ API call failed:", error);
        }
      }
    }
  };
  
  

  // Function to replace incorrect word with suggestion
  const replaceWord = (index, newWord) => {
    if (!editorRef.current) return;

    let words = editorRef.current.innerText.split(/\s+/);
    words[index] = newWord;

    editorRef.current.innerText = words.join(" ");

    // Remove replaced word from suggestions
    setIncorrectWords((prev) => prev.filter((w) => w.index !== index));
    setWordSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  // Highlight word on hover
  const highlightWordOnHover = (index) => {
    if (!editorRef.current) return;
    
    let words = editorRef.current.innerText.split(/\s+/);
    let newContent = words
      .map((word, i) => (i === index ? `<span class="highlight">${word}</span>` : word))
      .join(" ");
    editorRef.current.innerHTML = newContent;
  };

  // Remove highlight when hover is gone
  const removeHighlight = () => {
    if (!editorRef.current) return;

    // Restore normal text
    editorRef.current.innerHTML = editorRef.current.textContent;
  };
  const [animationStep, setAnimationStep] = useState(0);
  // const [trieNodes, setTrieNodes] = useState([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (animationStep < 5) {
        setAnimationStep(prevStep => prevStep + 1);
      }
    }, 1500); // Adjust the interval to control speed of animation
    
    return () => clearInterval(timer); // Clean up timer on unmount
  }, [animationStep]);

  const renderTrieAnimation = () => {
    switch (animationStep) {
      case 1:
        return <div className="trie-node">Root</div>;
      case 2:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">R</div>
          </>
        );
      case 3:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">R</div>
            <div className="trie-node">Re</div>
          </>
        );
      case 4:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">R</div>
            <div className="trie-node">Re</div>
            <div className="trie-node">Rep</div>
          </>
        );
      case 5:
        return (
          <>
            <div className="trie-node">Root</div>
            <div className="trie-node">R</div>
            <div className="trie-node">Re</div>
            <div className="trie-node">Rep</div>
            <div className="trie-node">Repa</div>
          </>
        );
      default:
        return <div className="trie-node">Root</div>;
    }
  };
  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SpellChecker using Trie</div>
        <div className="lang-selection">
          <button onClick={() => setSelectLang("english")} className={selectLang === "english" ? "active" : ""}>English</button>
          <button onClick={() => setSelectLang("bengali")} className={selectLang === "bengali" ? "active" : ""}>বাংলা</button>
          <button onClick={() => setSelectLang("hindi")} className={selectLang === "hindi" ? "active" : ""}>हिंदी</button>
          <button onClick={() => setSelectLang("manipuri")} className={selectLang === "manipuri" ? "active" : ""}>ꯃꯅꯤꯄꯨꯔꯤ</button>
          {/* <button onClick={() => setSelectLang("API 4")} className={selectLang === "API 4" ? "active" : ""}>API 4</button> */}
        </div>
      </nav>
      
      {/* Header Text Above Textbox */}
      <div className="header-text">
        <p>Type freely and let AI assist you with corrections and improvements.</p>
      </div>
      {/* API Selection Buttons */}
      <div className="api-selection">
        <button onClick={() => setSelectedAPI("spell-check")} className={selectedAPI === "spell-check" ? "active" : ""}>Trie Skips</button>
        <button onClick={() => setSelectedAPI("symspell")} className={selectedAPI === "symspell" ? "active" : ""}>Symspell</button>
        <button onClick={() => setSelectedAPI("pyspell")} className={selectedAPI === "pyspell" ? "active" : ""}>PySpell</button>
        {/* <button onClick={() => setSelectedAPI("API 4")} className={selectedAPI === "API 4" ? "active" : ""}>API 4</button> */}
      </div>
      <div className="editor-section">
        {/* Editable Textbox */}
        <div className="editor-container">
          <h3>Write Your Words</h3>
          <div ref={editorRef} contentEditable={true} className="editor-content" data-placeholder="Start typing..." onInput={checkText}></div>
        </div>

        {/* Right Side Suggestion Box */}
        <div className="suggestion-container">
          <h3>Suggestions</h3>
          {incorrectWords.length === 0 ? (
            <p className="no-errors">No errors found 🎉</p>
          ) : (
            incorrectWords.map(({ word, index }) => (
              <div key={index} className="suggestion-box" onMouseEnter={() => highlightWordOnHover(index)} onMouseLeave={removeHighlight}>
                <strong>{word}</strong>
                <div className="suggestion-list">
                  {wordSuggestions[index]?.map((suggestion, i) => (
                    <button key={i} onClick={() => replaceWord(index, suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trie Animation Section */}
      <div className="trie-animation-container">
        <h3>Trie Animation</h3>
        <div className="trie-animation">{renderTrieAnimation()}</div>
      </div>

      {/* Bottom Text with Explanation */}
      <div className="bottom-text">
        <p>
          A **Trie** is a tree-like data structure that is primarily used for storing strings, like words in a dictionary. It allows us to efficiently check if a word exists, find its closest matches, and find spelling corrections. Each node in a Trie represents a character, and words are stored by traversing these nodes character by character.

          When a word is typed, we start from the root and move down the tree based on the characters of the word. If we reach the end of the word and the node is marked as an **end-of-word** node, we know that the word exists in the Trie.

          For the **Spell Checker**, the **Trie** helps us find potential spelling errors quickly by comparing each word against the dictionary stored in the Trie. If a word does not match any path in the Trie, it is considered an incorrect word, and we provide suggestions for similar words using algorithms like **Levenshtein Distance**.

          As you type, we analyze the words using a combination of the Trie structure and spell-checking algorithms. If a word has a close match in the Trie, it is highlighted as a potential correction. The spell checker can suggest multiple similar words based on the current language (e.g., English, Hindi, Bengali, Manipuri). The words can then be replaced with a click of a button.

          This method is fast and efficient, especially when dealing with large dictionaries, as the Trie allows us to check each character in constant time.

          The dictionary used in this implementation is sourced from trusted open-source word lists for each language supported. Additionally, **Levenshtein Distance** is used to suggest words that are similar to the incorrect word, based on the number of character edits needed to convert one word into another.

          🔧 This spell checker uses different APIs such as **Trie Skips**, **SymSpell**, and **PySpell** to enhance its accuracy and efficiency.
        </p>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 SpellChecker using Trie | AI-Powered Writing Assistant</p>
      </footer>
  </div>

  );
};

export default App;
