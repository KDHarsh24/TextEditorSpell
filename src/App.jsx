import { useState, useRef } from "react";
import "./App.css";
import spellCheckAPI from "./api";
const App = () => {
  const editorRef = useRef(null);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [wordSuggestions, setWordSuggestions] = useState({});
  const [selectedAPI, setSelectedAPI] = useState("spell-check");
  const [selectLang, setSelectLang] = useState("english");
  // Function to check spelling mistakes
  // const checkText = async () => {
  //   if (!editorRef.current) return;
  
  //   const text = editorRef.current.innerText.trim();
  //   const words = text.split(/\s+/);
  
  //   const lastWord = words[words.length - 1];
  //   if (!lastWord) return;
  
  //   // Only spellcheck new words not already checked
  //   const alreadyCheckedIndexes = incorrectWords.map(({ index }) => index);
  //   if (alreadyCheckedIndexes.includes(words.length - 1)) return;
  
  //   const suggestions = await spellCheckAPI(lastWord, selectedAPI, selectLang);
  //   if (suggestions.length > 0) {
  //     setIncorrectWords((prev) => [...prev, { word: lastWord, index: words.length - 1 }]);
  //     setWordSuggestions((prev) => ({ ...prev, [words.length - 1]: suggestions }));
  //   }
  // };
  
  const lastTextRef = useRef("");

const handleInput = async () => {
  if (!editorRef.current) return;

  const currentText = editorRef.current.innerText;
  const trimmedText = currentText.trim();
  const words = trimmedText.split(/\s+/);

  const lastText = lastTextRef.current;
  lastTextRef.current = currentText; // update for next time

  // Detect if space was just added
  if (currentText.length > lastText.length && currentText.endsWith(" ")) {
    const lastWord = words[words.length - 1];
    if (!lastWord) return;

    const alreadyCheckedIndexes = incorrectWords.map(({ index }) => index);
    if (alreadyCheckedIndexes.includes(words.length - 1)) return;

    const suggestions = await spellCheckAPI(lastWord, selectedAPI, selectLang);
    if (suggestions.length > 0) {
      setIncorrectWords((prev) => [...prev, { word: lastWord, index: words.length - 1 }]);
      setWordSuggestions((prev) => ({ ...prev, [words.length - 1]: suggestions }));
    }
  }

  // Clean up deleted words
  const updatedIncorrectWords = incorrectWords.filter(({ word }) => words.includes(word));
  setIncorrectWords(updatedIncorrectWords);

  const updatedSuggestions = {};
  updatedIncorrectWords.forEach(({ index }) => {
    updatedSuggestions[index] = wordSuggestions[index];
  });
  setWordSuggestions(updatedSuggestions);
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

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SpellChecker using Trie</div>
        <div className="lang-selection">
          <button onClick={() => setSelectLang("english")} className={selectLang === "english" ? "active" : ""}>English</button>
          <button onClick={() => setSelectLang("bengali")} className={selectLang === "bengali" ? "active" : ""}>বাংলা</button>
          <button onClick={() => setSelectLang("hindi")} className={selectLang === "hindi" ? "active" : ""}>हिंदी</button>
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
          <div ref={editorRef} contentEditable={true} className="editor-content" data-placeholder="Start typing..." onInput={handleInput}></div>
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

      {/* Bottom Text Below Textbox */}
      <div className="bottom-text">
        <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fermentum erat non velit tincidunt, eu elementum elit molestie. Mauris luctus, metus at condimentum sodales, ligula orci sodales sapien, nec tincidunt metus urna at erat. Nam nec purus et urna ultrices scelerisque. Donec vitae erat non mi dictum auctor vel a est. In eget massa lorem. Vivamus tristique diam ut metus tincidunt, sed facilisis libero hendrerit. Suspendisse vel nibh nec mauris consequat rhoncus. Duis eget dui eget sapien euismod pretium. Sed accumsan pharetra ipsum, non volutpat lacus tempor non.

        Curabitur vehicula felis in fermentum ultricies. Proin scelerisque, velit eget feugiat vehicula, urna metus fringilla ligula, eget hendrerit neque mauris ut erat. Etiam et ligula venenatis, aliquet ligula ut, consectetur felis. Sed nec justo in dui tincidunt tincidunt. Nam suscipit vehicula magna, ac suscipit sapien tincidunt nec. Donec eu tortor feugiat, laoreet nisl ut, suscipit libero. Nulla ultricies justo in justo sodales, vel vulputate libero accumsan. Fusce auctor, nisl in mattis fermentum, risus augue tempor magna, id faucibus tortor metus ac nunc. Phasellus nec nisi ut elit vehicula venenatis.
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
