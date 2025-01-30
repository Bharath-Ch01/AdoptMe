import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchPage.css';
import PetsIcon from '@mui/icons-material/Pets';

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
  const dropdownRef = useRef(null);
  const [showMatch, setShowMatch] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    // Handle "Adopt Me" Click
    const handleAdopt = () => {
        setShowMatch(false); // Hide match container
        setShowAlert(true); // Show success alert
    };

  // Fetch the list of breeds from the API
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get(
          'https://frontend-take-home-service.fetch.com/dogs/breeds',
          { withCredentials: true }
        );
        setBreeds(response.data);
      } catch (err) {
        console.error('Failed to fetch breeds:', err);
      }
    };
    fetchBreeds();
  }, []);

  // Fetch dogs based on the selected breed and sort order
  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder]);

  const fetchDogs = () => {
    let query = `https://frontend-take-home-service.fetch.com/dogs/search?size=50&sort=breed:${sortOrder}`;
    if (selectedBreed) {
      query += `&breeds=${selectedBreed}`;
    }
    axios
      .get(query, { withCredentials: true })
      .then((response) => {
        const dogIds = response.data.resultIds;
        axios
          .post('https://frontend-take-home-service.fetch.com/dogs', dogIds, { withCredentials: true })
          .then((res) => {
            setDogs(res.data);
            setFilteredDogs(res.data); // Update filtered dogs for the carousel
          })
          .catch((error) => console.error('Error fetching dog details:', error));
      })
      .catch((error) => console.error('Error searching dogs:', error));
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true); // Show dropdown when typing
  };

  // Handle breed selection from dropdown
  const handleBreedSelect = (breed) => {
    setSearchTerm(breed); // Update search box with the selected breed
    setSelectedBreed(breed); // Set the selected breed
    setShowDropdown(false); // Hide the dropdown
    fetchDogs(); // Fetch dogs for the selected breed
  };

  // Toggle favorite dogs
  const toggleFavorite = (dogId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(dogId)
        ? prevFavorites.filter((id) => id !== dogId)
        : [...prevFavorites, dogId]
    );
  };

  // Generate a match from favorites
  const generateMatch = async () => {
    if (favorites.length === 0) return;
    try {
      const response = await axios.post(
        'https://frontend-take-home-service.fetch.com/dogs/match',
        favorites,
        { withCredentials: true }
      );
      const matchedDogId = response.data.match;
      setMatch(matchedDogId);

      axios
        .post('https://frontend-take-home-service.fetch.com/dogs', [matchedDogId], { withCredentials: true })
        .then((res) => setMatchDog(res.data[0]))
        .catch((error) => console.error('Error fetching matched dog details:', error));
    } catch (error) {
      console.error('Error generating match:', error);
    }
  };

  // Toggle sort order
  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch('https://frontend-take-home-service.fetch.com/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setShowAlert(false);
    navigate('/');
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, filteredDogs.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-container">
      <nav className="navbar">
        <div className="site-title">
          <PetsIcon /> Adopt Me
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <h2>Welcome, Guest!</h2>
      <div className="search-controls fixed-controls">
      <select
          className="breed-select"
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
        >
          <option value="">Select Your Puppy</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>
      
        <button className="sort-button" onClick={handleSort}>
          Sort {sortOrder === 'asc' ? '▲' : '▼'}
        </button>
      </div>
      <div className="carousel-container">
        <button className="carousel-button" onClick={prevSlide}>
          ❮
        </button>
        <div className="dog-carousel">
          {filteredDogs.slice(currentIndex, currentIndex + 3).map((dog) => (
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
        <button className="carousel-button" onClick={nextSlide}>
          ❯
        </button>
      </div>
      <div className="match-section">
        <button className="match-button" onClick={generateMatch}>
          Find My Match
        </button>
        <div className='match-container'>
        {showMatch && matchDog && (
          <div className="match-result">
            <h3>Your Best Match:</h3>
            <img className="match-image" src={matchDog.img} alt={matchDog.name} />
            <p>
              {matchDog.name} - {matchDog.breed}
            </p>
            <button className="adopt-button" onClick={handleAdopt}> Adopt !
           </button>
          </div>
        )}
        {showAlert && (
                <div className="adopt-alert">
                    <p> Thanks for adopting! 🐶</p>
                    <button className="close-alert" onClick={handleLogout}>
                        Close ! See you Again!
                    </button>
                </div>
            )}
        
        </div>
      </div>
    </div>
  );
};

export default SearchPage;