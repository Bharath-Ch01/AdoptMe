import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SearchPage.css';

function SearchPage() {
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get(
          'https://frontend-take-home-service.fetch.com/dogs/breeds',
          { withCredentials: true }
        );
        setBreeds(response.data);
      } catch (err) {
        setError('Failed to fetch breeds.');
      }
    };
    fetchBreeds();
  }, []);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get(
          `https://frontend-take-home-service.fetch.com/dogs/search?breeds=${selectedBreed}&sort=breed:${sortOrder}&size=10&from=${(page - 1) * 10}`,
          { withCredentials: true }
        );
        const dogDetails = await axios.post(
          'https://frontend-take-home-service.fetch.com/dogs',
          response.data.resultIds,
          { withCredentials: true }
        );
        setDogs(dogDetails.data);
      } catch (err) {
        setError('Failed to fetch dogs.');
      }
    };
    fetchDogs();
  }, [selectedBreed, sortOrder, page]);

  const handleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Search Dogs</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="filters">
        <select
          className="breed-select"
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>
        <button
          className="sort-button"
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          Sort: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>
      <div className="dog-list">
        {dogs.map((dog) => (
          <div key={dog.id} className="dog-card">
            <img src={dog.img} alt={dog.name} className="dog-image" />
            <h2 className="dog-name">{dog.name}</h2>
            <p>Breed: {dog.breed}</p>
            <p>Age: {dog.age}</p>
            <p>Location: {dog.zip_code}</p>
            <button
              className={`favorite-button ${favorites.includes(dog.id) ? 'favorited' : ''}`}
              onClick={() => handleFavorite(dog.id)}
            >
              {favorites.includes(dog.id) ? 'Unfavorite' : 'Favorite'}
            </button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <button
          className="pagination-button"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SearchPage;
