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
      <div className="trie-explanation">
        <h2>🔍 How Trie-Based Spell Checker Works</h2>
        <p>
          This spell checker uses a <strong>Trie</strong> (Prefix Tree) to efficiently store and query words across multiple languages. As you type, the system breaks input into words and checks whether each word exists in the language-specific Trie structure.
        </p>
        <p>
          If a word is not found, it performs a <strong>Levenshtein Edit Distance</strong> traversal through the Trie to find the closest alternatives. This helps suggest possible corrections even for heavily misspelled words.
        </p>
        
        <h3>🧬 Edit Distance using Trie</h3>
        <p>
          The Trie allows us to do a **dynamic programming**-based edit distance traversal. At each node, we compute the cost of:
          <ul>
            <li>➕ Insertion</li>
            <li>❌ Deletion</li>
            <li>✏️ Substitution</li>
            <li>✅ Match</li>
          </ul>
          This drastically reduces the number of computations by pruning irrelevant branches.
        </p>

        <h3>🌐 Dictionary Sources</h3>
        <ul>
          <li>📘 English: SCOWL & Hunspell Dictionary</li>
          <li>📕 Hindi: AI4Bharat, CFILT IIT Bombay corpora</li>
          <li>📗 Bengali: OpenSubtitles, Indic NLP Corpora</li>
          <li>📙 Manipuri: Wiktionary dump + community contributions</li>
        </ul>

        <div className="bottom-text">
        <h3>🌲 Visual Trie Tree with Edit Distance</h3>
        <p>Let's visualize a small Trie with the words: <strong>car</strong>, <strong>cat</strong>, <strong>cap</strong>, and <strong>bat</strong>. When you type a word, the algorithm walks through this tree to find closest matches using edit distance.</p>

        <div className="visual-trie">
          <div className="node">""</div>
          <div className="level">
            <div className="branch">
              <div className="node">c</div>
              <div className="level">
                <div className="branch">
                  <div className="node">a</div>
                  <div className="level">
                    <div className="branch">
                      <div className="node">r</div>
                      <div className="node leaf">car</div>
                    </div>
                    <div className="branch">
                      <div className="node">t</div>
                      <div className="node leaf">cat</div>
                    </div>
                    <div className="branch">
                      <div className="node">p</div>
                      <div className="node leaf">cap</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="branch">
              <div className="node">b</div>
              <div className="level">
                <div className="branch">
                  <div className="node">a</div>
                  <div className="level">
                    <div className="branch">
                      <div className="node">t</div>
                      <div className="node leaf">bat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        <h4>🧠 Edit Distance Traversal</h4>
        <p>
          Suppose you typed <code>kat</code>. It's not found, so we traverse this Trie by checking all nodes and calculate edit distance at each branch.
          <ul>
            <li>🔁 Match: same letter, no cost</li>
            <li>✏️ Substitution: cost +1</li>
            <li>➕ Insertion / ❌ Deletion: cost +1</li>
          </ul>
          <strong>Example:</strong> <code>kat</code> → edit distance 1 from <code>cat</code> (k→c)
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
