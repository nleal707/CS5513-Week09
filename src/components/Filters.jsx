// The filters shown on the recipe listings page

import Tag from "@/src/components/Tag.jsx";

function FilterSelect({ label, options, value, onChange, name, icon }) {
  return (
    <div>
      <img src={icon} alt={label} />
      <label>
        {label}
        <select value={value} onChange={onChange} name={name}>
          {options.map((option, index) => (
            <option value={option} key={index}>
              {option === "" ? "All" : option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function Filters({ filters, setFilters }) {
  const handleSelectionChange = (event, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const updateField = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Recipes</p>
            <p>Sorted by {filters.sort || "Rating"}</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <FilterSelect
            label="Cuisine Type"
            options={[
              "",
              "Italian",
              "Chinese",
              "Japanese",
              "Mexican",
              "Indian",
              "Mediterranean",
              "American",
              "French",
              "Thai",
              "Korean",
              "Vietnamese",
              "Greek",
              "Spanish",
              "German",
              "Middle Eastern"
            ]}
            value={filters.cuisineType}
            onChange={(event) => handleSelectionChange(event, "cuisineType")}
            name="cuisineType"
            icon="/food.svg"
          />

          <FilterSelect
            label="Difficulty"
            options={["", "Easy", "Medium", "Hard"]}
            value={filters.difficulty}
            onChange={(event) => handleSelectionChange(event, "difficulty")}
            name="difficulty"
            icon="/sortBy.svg"
          />

          <FilterSelect
            label="Cooking Time"
            options={["", "< 15 min", "15-30 min", "30-60 min", "60+ min"]}
            value={filters.cookingTime}
            onChange={(event) => handleSelectionChange(event, "cookingTime")}
            name="cookingTime"
            icon="/price.svg"
          />

          <FilterSelect
            label="Dietary Restrictions"
            options={[
              "",
              "Vegetarian",
              "Vegan",
              "Gluten-Free",
              "Dairy-Free",
              "Nut-Free",
              "Low-Carb",
              "Keto",
              "Paleo",
              "Halal",
              "Kosher"
            ]}
            value={filters.dietaryRestrictions}
            onChange={(event) => handleSelectionChange(event, "dietaryRestrictions")}
            name="dietaryRestrictions"
            icon="/location.svg"
          />

          <FilterSelect
            label="Sort"
            options={["Rating", "Review", "Cooking Time"]}
            value={filters.sort}
            onChange={(event) => handleSelectionChange(event, "sort")}
            name="sort"
            icon="/sortBy.svg"
          />

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    cuisineType: "",
                    difficulty: "",
                    cookingTime: "",
                    dietaryRestrictions: "",
                    sort: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {Object.entries(filters).map(([type, value]) => {
          // The main filter bar already specifies what
          // sorting is being used. So skip showing the
          // sorting as a 'tag'
          if (type == "sort" || value == "") {
            return null;
          }
          return (
            <Tag
              key={value}
              type={type}
              value={value}
              updateField={updateField}
            />
          );
        })}
      </div>
    </section>
  );
}
