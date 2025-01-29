import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchPage.css';

const SearchPage = ({ user }) => {
  const [breeds, setBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [match, setMatch] = useState(null);
  const [matchDog, setMatchDog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://frontend-take-home-service.fetch.com/dogs/breeds')
      .then(response => setBreeds(response.data))
      .catch(error => console.error('Error fetching breeds:', error));
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder]);

  const fetchDogs = () => {
    let query = `https://frontend-take-home-service.fetch.com/dogs/search?size=50&sort=breed:${sortOrder}`;
    if (selectedBreed) {
      query += `&breeds=${selectedBreed}`;
    }
    axios.get(query, { withCredentials: true })
      .then(response => {
        axios.post('https://frontend-take-home-service.fetch.com/dogs', response.data.resultIds, { withCredentials: true })
          .then(res => {
            setDogs(res.data);
            setFilteredDogs(res.data);
          })
          .catch(error => console.error('Error fetching dog details:', error));
      })
      .catch(error => console.error('Error searching dogs:', error));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    setSearchTerm(breed);
    setShowDropdown(false);
    fetchDogs();
  };

  const toggleFavorite = (dogId) => {
    setFavorites(prevFavorites =>
      prevFavorites.includes(dogId)
        ? prevFavorites.filter(id => id !== dogId)
        : [...prevFavorites, dogId]
    );
  };

  const generateMatch = async () => {
    if (favorites.length === 0) return;
    try {
      const response = await axios.post('https://frontend-take-home-service.fetch.com/dogs/match', favorites, { withCredentials: true });
      const matchedDogId = response.data.match;
      setMatch(matchedDogId);
      
      axios.post('https://frontend-take-home-service.fetch.com/dogs', [matchedDogId], { withCredentials: true })
        .then(res => setMatchDog(res.data[0]))
        .catch(error => console.error('Error fetching matched dog details:', error));
    } catch (error) {
      console.error('Error generating match:', error);
    }
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleLogout = async () => {
    await fetch('https://frontend-take-home-service.fetch.com/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/');
  };

  const nextSlide = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, filteredDogs.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  return (
    <div className="search-container">
      <nav className="navbar">
        <div className="site-title">Adopt Me</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>
      <h2>Welcome, Chandana!</h2>
      <div className="search-controls">
        <div className="search-bar" onBlur={() => setTimeout(() => setShowDropdown(false), 200)}>
          <input type="text" placeholder="Search your puppy" value={searchTerm} onChange={handleSearch} onFocus={() => setShowDropdown(true)} />
          {showDropdown && breeds.length > 0 && (
            <ul className="dropdown-list">
              {breeds.filter(breed => breed.toLowerCase().includes(searchTerm.toLowerCase())).map(breed => (
                <li key={breed} onClick={() => handleBreedSelect(breed)}>{breed}</li>
              ))}
            </ul>
          )}
        </div>
        <button className="sort-button" onClick={handleSort}>Sort {sortOrder === 'asc' ? '▲' : '▼'}</button>
      </div>
      <div className="carousel-container">
        <button className="carousel-button" onClick={prevSlide}>❮</button>
        <div className="dog-carousel">
          {filteredDogs.slice(currentIndex, currentIndex + 3).map(dog => (
            <div className="dog-card" key={dog.id}>
              <img className="dog-image" src={dog.img} alt={dog.name} />
              <div className="dog-info">
                <h3>{dog.name}</h3>
                <p>Breed: {dog.breed}</p>
                <p>Age: {dog.age}</p>
                <p>Location: {dog.zip_code}</p>
                <button className="favorite-button" onClick={() => toggleFavorite(dog.id)}>
                  {favorites.includes(dog.id) ? '💔 Unfavorite' : '❤️ Favorite'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-button" onClick={nextSlide}>❯</button>
      </div>
      <div className="match-section">
        <button className="match-button" onClick={generateMatch}>Find My Match</button>
        {matchDog && (
          <div className="match-result">
            <h3>Your Best Match:</h3>
            <img className="match-image" src={matchDog.img} alt={matchDog.name} />
            <p>{matchDog.name} - {matchDog.breed}</p>
      </div>)}
    </div>
    </div>
  );
};
export default SearchPage;
