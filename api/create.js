const { data, error } = await supabase
      .from('links')
      .insert([{ 
        id: id.trim(), 
        url: finalUrl.trim(), 
        title: title.trim(), 
        image: image ? image.trim() : null 
      }])
      .select();

    if (error) {
      console.error('Supabase Error Detail:', error);
      // TAMPILKAN ERROR ASLI KE RESPONSE
      return res.status(500).json({ 
        error: error.message, 
        details: error.details, 
        hint: error.hint,
        code: error.code 
      });
    }
