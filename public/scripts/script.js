const favorietenKnop = document.querySelector("#favorietKnop");

favorietenKnop.addEventListener("click", voegAanFavorieten)

async function voegAanFavorieten() {
    const houseId = favorietenKnop.dataset.houseId;
    const data = { id: houseId };

    try {
        const response = await fetch("/favorieten", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Server response:', result);

        if (result.added) {
            favorietenKnop.classList.add('favoriet');
        } else {
            favorietenKnop.classList.remove('favoriet');
        }

    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}