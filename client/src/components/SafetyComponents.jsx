const MAX_LENGTH = 100;

// Secure input component with character limit and warning
const SecureInput = ({ value, onChange, onKeyDown, placeholder, autoFocus, isLarge = false }) => {
    const warning = value.length >= MAX_LENGTH - 10;
    return (
      <div className={`input-wrapper ${isLarge ? 'large' : ''}`}>
        <input
          type="text"
          maxLength={MAX_LENGTH}
          value={value}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[<>]/g, '').slice(0, MAX_LENGTH);
            onChange({ target: { value: sanitized } });
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          autoFocus={autoFocus}
          className={`${warning ? 'warning' : ''} ${isLarge ? 'large-input' : ''}`}
        />
        <div className={`char-counter ${warning ? 'warning' : ''}`}>
          {value.length}/{MAX_LENGTH}
        </div>
      </div>
    );
  };

export default SecureInput;