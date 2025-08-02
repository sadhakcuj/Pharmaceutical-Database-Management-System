import styled from "styled-components";
import { AiOutlineSearch } from "react-icons/ai";

const StyledSearchbar = styled.div`
  display: flex;
  align-items: stretch;
  gap: 1rem;

  .input {
    position: relative;

    div {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-45%) !important;
    }
  }

  input {
    padding: 0.5rem 0;
    padding-left: 0.5rem;
    padding-right: 1.5rem;
    width: 280px;
  }

  select {
    cursor: pointer;
    font-size: 1rem;
    height: 2.25rem;
  }
`;

export default function Searchbar({
  onKeywordChange,
  onFieldChange,
  defaultField,
  fields,
}: {
  onKeywordChange?: (keyword: string) => void;
  onFieldChange?: (field: string) => void;
  fields: { name: string; value: string }[];
  defaultField?: number;
}) {
  return (
    <StyledSearchbar>
      <select
        defaultValue={
          defaultField !== undefined ? fields[defaultField].value : undefined
        }
        onChange={(e) => {
          if (onFieldChange) {
            onFieldChange(e.currentTarget.value);
          }
        }}>
        {fields.map((field, i) => (
          <option key={i} value={field.value}>
            {field.name}
          </option>
        ))}
      </select>
      <div className="input">
        <input
          type="text"
          placeholder="Enter un mot clé..."
          onChange={(e) => {
            if (onKeywordChange) {
              onKeywordChange(e.currentTarget.value);
            }
          }}
        />
        <div>
          <AiOutlineSearch />
        </div>
      </div>
    </StyledSearchbar>
  );
}
