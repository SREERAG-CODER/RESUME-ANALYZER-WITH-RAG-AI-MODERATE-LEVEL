def get_match_rating(score):
    if score <= 25:
        return "Not Relevant to Your Skills"

    elif score <= 40:
        return "Weak Match"

    elif score <= 60:
        return "Moderate Match"

    elif score <= 80:
        return "Strong Match"

    return "Excellent Match"